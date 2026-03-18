using MediatR;

namespace Application.Rides.Queries.GetRideDetails;

public record GetRideDetailsQuery(Guid Id) : IRequest<RideDetailsDto>;