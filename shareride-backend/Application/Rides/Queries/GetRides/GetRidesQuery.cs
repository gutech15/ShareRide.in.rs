using MediatR;

namespace Application.Rides.Queries.GetRides;

public record GetRidesQuery(
    string? StartCity,
    string? EndCity,
    DateTime? Date
) : IRequest<List<RideSearchDto>>;