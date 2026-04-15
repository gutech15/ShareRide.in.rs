using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService; 

    public CreateBookingCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var ride = await _context.Rides
            .FirstOrDefaultAsync(r => r.Id == request.RideId, cancellationToken);

        if (ride == null)
            throw new Exception("Voznja nije pronadjena.");

        if (ride.DriverId == request.PassengerId)
            throw new Exception("Ne mozete da napravite rezervaciju za sopstvenu voznju.");

        var existingBooking = await _context.Bookings
            .AnyAsync(b => b.RideId == request.RideId
                        && b.PassengerId == request.PassengerId
                        && (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Approved),
                        cancellationToken);

        if (existingBooking)
        {
            throw new Exception("Vec ste poslali zahtev ili imate rezervaciju za ovu voznju.");
        }

        if (request.SeatsReserved <= 0)
            throw new Exception("Broj mesta mora biti veci od 0.");

        if (request.SeatsReserved > ride.AvailableSeats)
            throw new Exception("Nema dovoljno slobodnih mesta.");

        var status = ride.IsAutoConfirmation
            ? BookingStatus.Approved
            : BookingStatus.Pending;

        var booking = new Booking
        {
            RideId = request.RideId,
            PassengerId = request.PassengerId,
            SeatsReserved = request.SeatsReserved,
            Status = status
        };

        _context.Bookings.Add(booking);

        var notificationsToSend = new List<Notification>();

        if (status == BookingStatus.Approved)
        {
            ride.AvailableSeats -= request.SeatsReserved;

            var passengerNote = new Notification
            {
                UserId = request.PassengerId,
                Message = $"Vasa rezervacija za voznju {ride.StartCity} - {ride.EndCity} je USPESNO KREIRANA!",
                ActionUrl = $"/rides/{ride.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(passengerNote);
            notificationsToSend.Add(passengerNote);

            var driverNote = new Notification
            {
                UserId = ride.DriverId,
                Message = $"Novi putnik je rezervisao mesta na vasoj voznji {ride.StartCity} - {ride.EndCity}.",
                ActionUrl = $"/rides/{ride.Id}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(driverNote);
            notificationsToSend.Add(driverNote);
        }
        else
        {
            var requestNote = new Notification
            {
                UserId = ride.DriverId,
                Message = $"Dobili ste novi zahtev za voznju {ride.StartCity} - {ride.EndCity}.",
                ActionUrl = "/requests", 
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(requestNote);
            notificationsToSend.Add(requestNote);
        }

        await _context.SaveChangesAsync(cancellationToken);

        foreach (var note in notificationsToSend)
        {
            await _notificationService.SendNotificationAsync(note.Id, note.UserId, note.Message, note.ActionUrl);
        }

        return booking.Id;
    }
}