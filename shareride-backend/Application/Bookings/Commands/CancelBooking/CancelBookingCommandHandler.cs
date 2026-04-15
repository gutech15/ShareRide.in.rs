using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Commands.CancelBooking;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService; 

    public CancelBookingCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .Include(b => b.Ride)
            .Include(b => b.Passenger)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            throw new KeyNotFoundException("Zahtev nije pronadjen.");

        if (booking.PassengerId != request.PassengerId)
            throw new UnauthorizedAccessException("Samo putnik koji je poslao zahtev moze da ga otkaze.");

        if (booking.Status == BookingStatus.Rejected || booking.Status == BookingStatus.CancelledByPassenger)
            throw new InvalidOperationException("Ovaj zahtev je vec odbijen ili otkazan.");

        if (booking.Ride.DepartureTime < DateTime.UtcNow)
            throw new InvalidOperationException("Ne mozete otkazati voznju koja je vec pocela ili se zavrsila.");

        var oldStatus = booking.Status;
        booking.Status = BookingStatus.CancelledByPassenger;

        if (oldStatus == BookingStatus.Approved)
        {
            booking.Ride.AvailableSeats += booking.SeatsReserved;
        }

        var notification = new Notification
        {
            UserId = booking.Ride.DriverId,
            Message = $"Putnik {booking.Passenger.FirstName} je OTKAZAO rezervaciju za vasu voznju {booking.Ride.StartCity} - {booking.Ride.EndCity}.",
            ActionUrl = $"/rides/{booking.RideId}", 
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendNotificationAsync(
            notification.Id,
            notification.UserId,
            notification.Message,
            notification.ActionUrl
        );
    }
}