using MediatR;

namespace Application.Reviews.Queries.GetUsersToRate;

public class GetUsersToRateQuery : IRequest<List<UserToRateDto>>
{
    public Guid RideId { get; set; }
    public Guid CurrentUserId { get; set; }
}