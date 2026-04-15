using MediatR;

namespace Application.Bookings.Commands.CreateBooking;

public class CreateBookingCommand : IRequest<Guid>
{
    public Guid RideId { get; set; }
    public Guid PassengerId { get; set; }
    public int SeatsReserved { get; set; }
}