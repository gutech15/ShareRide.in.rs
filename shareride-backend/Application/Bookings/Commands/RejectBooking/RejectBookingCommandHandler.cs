using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Commands.RejectBooking;

public class RejectBookingCommandHandler : IRequestHandler<RejectBookingCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public RejectBookingCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task Handle(RejectBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .Include(b => b.Ride)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            throw new KeyNotFoundException("Zahtev nije pronadjen.");

        if (booking.Ride.DriverId != request.DriverId)
            throw new UnauthorizedAccessException("Samo vozac moze odbiti ovaj zahtev.");

        if (booking.Status != BookingStatus.Pending)
            throw new InvalidOperationException("Moguce je odbiti samo zahteve koji su na cekanju.");

        booking.Status = BookingStatus.Rejected;

        var notification = new Notification
        {
            UserId = booking.PassengerId,
            Message = $"Vas zahtev za voznju {booking.Ride.StartCity} - {booking.Ride.EndCity} je nazalost ODBIJEN.",
            ActionUrl = "/requests", 
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