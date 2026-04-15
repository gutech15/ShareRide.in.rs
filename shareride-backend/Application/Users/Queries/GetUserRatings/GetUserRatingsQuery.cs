using MediatR;

namespace Application.Users.Queries.GetUserRatings;

public class GetUserRatingsQuery : IRequest<UserRatingsDto>
{
    public Guid UserId { get; set; }

    public GetUserRatingsQuery(Guid userId)
    {
        UserId = userId;
    }
}