using MediatR;

namespace Application.Bookings.Commands.AcceptBooking;

public class AcceptBookingCommand : IRequest
{
    public Guid BookingId { get; set; }
    public Guid DriverId { get; set; }
}