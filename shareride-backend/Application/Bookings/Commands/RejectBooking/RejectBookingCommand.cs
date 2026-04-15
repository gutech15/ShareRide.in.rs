using MediatR;

namespace Application.Bookings.Commands.RejectBooking;

public class RejectBookingCommand : IRequest
{
    public Guid BookingId { get; set; }
    public Guid DriverId { get; set; } 
}