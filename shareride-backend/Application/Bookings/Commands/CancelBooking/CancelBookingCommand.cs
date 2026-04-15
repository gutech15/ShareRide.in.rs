using MediatR;

namespace Application.Bookings.Commands.CancelBooking;

public class CancelBookingCommand : IRequest
{
    public Guid BookingId { get; set; }
    public Guid PassengerId { get; set; } 
}