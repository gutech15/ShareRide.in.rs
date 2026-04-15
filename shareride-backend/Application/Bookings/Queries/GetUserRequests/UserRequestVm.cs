namespace Application.Bookings.Queries.GetUserRequests;

public class UserRequestsVm
{
    public List<UserRequestDto> IncomingRequests { get; set; } = new();
    public List<UserRequestDto> OutgoingRequests { get; set; } = new();
}