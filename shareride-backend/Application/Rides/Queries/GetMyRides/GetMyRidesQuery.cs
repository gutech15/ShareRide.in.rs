using MediatR;

namespace Application.Rides.Queries.GetMyRides;

public class GetMyRidesQuery : IRequest<List<MyRideDto>>
{
    public Guid UserId { get; set; }
    public string Status { get; set; } = "active"; 
}