using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Rides.Commands.CancelRide;

public record CancelRideCommand(Guid RideId, Guid DriverId) : IRequest;

public class CancelRideHandler : IRequestHandler<CancelRideCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public CancelRideHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task Handle(CancelRideCommand request, CancellationToken cancellationToken)
    {
        var ride = await _context.Rides
            .Include(r => r.Bookings)
            .FirstOrDefaultAsync(r => r.Id == request.RideId, cancellationToken);

        if (ride == null)
            throw new Exception("Voznja nije pronadjena.");

        if (ride.DriverId != request.DriverId)
            throw new UnauthorizedAccessException("Nemate dozvolu da otkazete tudju voznju.");

        if (DateTime.UtcNow >= ride.DepartureTime.AddHours(-1))
            throw new Exception("Voznju je moguce otkazati najkasnije sat vremena pre polaska.");

        if (ride.Status == RideStatus.Cancelled)
            throw new Exception("Voznja je vec otkazana.");

        ride.Status = RideStatus.Cancelled;

        var notificationsToSend = new List<Notification>();

        var approvedBookings = ride.Bookings
            .Where(b => b.Status == BookingStatus.Approved || b.Status == BookingStatus.Pending)
            .ToList();

        foreach (var booking in approvedBookings)
        {
            booking.Status = BookingStatus.CancelledByDriver;

            var cancelNote = new Notification
            {
                UserId = booking.PassengerId,
                Message = $"Vozac je otkazao voznju {ride.StartCity} - {ride.EndCity} ({ride.DepartureTime:dd.MM. HH:mm}h).",
                ActionUrl = $"/rides/{ride.Id}",
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(cancelNote);

            notificationsToSend.Add(cancelNote);
        }

        await _context.SaveChangesAsync(cancellationToken);

        foreach (var note in notificationsToSend)
        {
            await _notificationService.SendNotificationAsync(note.Id, note.UserId, note.Message, note.ActionUrl);
        }
    }
}