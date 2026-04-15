using MediatR;

namespace Application.Bookings.Queries.GetUserRequests;

public class GetUserRequestsQuery : IRequest<UserRequestsVm>
{
    public Guid UserId { get; set; }
}