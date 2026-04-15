using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Commands.AcceptBooking;

public class AcceptBookingCommandHandler : IRequestHandler<AcceptBookingCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public AcceptBookingCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task Handle(AcceptBookingCommand request, CancellationToken cancellationToken)
    {
        var targetBooking = await _context.Bookings
            .Include(b => b.Ride)
            .ThenInclude(r => r.Bookings)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (targetBooking == null)
            throw new KeyNotFoundException("Zahtev nije pronadjen.");

        if (targetBooking.Ride.DriverId != request.DriverId)
            throw new UnauthorizedAccessException("Samo vozac moze da prihvati ovaj zahtev.");

        if (targetBooking.Status != BookingStatus.Pending)
            throw new InvalidOperationException("Moguce je prihvatiti samo zahteve koji su na cekanju.");

        var currentlyApprovedSeats = targetBooking.Ride.Bookings
            .Where(b => b.Status == BookingStatus.Approved)
            .Sum(b => b.SeatsReserved);

        var remainingSeats = targetBooking.Ride.AvailableSeats - currentlyApprovedSeats;

        if (targetBooking.SeatsReserved > remainingSeats)
        {
            throw new InvalidOperationException("Nema dovoljno slobodnih mesta za ovaj zahtev.");
        }

        targetBooking.Status = BookingStatus.Approved;

        var notificationsToSend = new List<Notification>();

        var acceptNote = new Notification
        {
            UserId = targetBooking.PassengerId,
            Message = $"Vas zahtev za voznju {targetBooking.Ride.StartCity} - {targetBooking.Ride.EndCity} je PRIHVACEN!",
            ActionUrl = $"/rides/{targetBooking.RideId}",
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(acceptNote);
        notificationsToSend.Add(acceptNote);

        var newRemainingSeats = remainingSeats - targetBooking.SeatsReserved;
        var bookingsToAutoReject = new List<Booking>();

        if (newRemainingSeats == 0)
        {
            bookingsToAutoReject = targetBooking.Ride.Bookings
                .Where(b => b.Status == BookingStatus.Pending && b.Id != targetBooking.Id)
                .ToList();
        }
        else if (newRemainingSeats > 0)
        {
            bookingsToAutoReject = targetBooking.Ride.Bookings
                .Where(b => b.Status == BookingStatus.Pending && b.Id != targetBooking.Id && b.SeatsReserved > newRemainingSeats)
                .ToList();
        }

        foreach (var pending in bookingsToAutoReject)
        {
            pending.Status = BookingStatus.Rejected;

            var rejectNote = new Notification
            {
                UserId = pending.PassengerId,
                Message = $"Nazalost, voznja {targetBooking.Ride.StartCity} - {targetBooking.Ride.EndCity} je popunjena i vas zahtev je odbijen.",
                ActionUrl = "/requests",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(rejectNote);
            notificationsToSend.Add(rejectNote);
        }

        await _context.SaveChangesAsync(cancellationToken);

        foreach (var note in notificationsToSend)
        {
            await _notificationService.SendNotificationAsync(note.Id, note.UserId, note.Message, note.ActionUrl);
        }
    }
}