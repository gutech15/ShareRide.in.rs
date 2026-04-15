using MediatR;

namespace Application.Bookings.Queries.CheckBooking;

public class CheckBookingQuery : IRequest<bool>
{
    public Guid RideId { get; set; }
    public Guid PassengerId { get; set; }
}