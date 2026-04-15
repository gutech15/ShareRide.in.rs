using Domain.Enums;

namespace Application.Bookings.Queries.GetUserRequests;

public class UserRequestDto
{
    public Guid BookingId { get; set; }
    public Guid RideId { get; set; }
    public string StartCity { get; set; } = string.Empty;
    public string EndCity { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; } 

    public Guid OtherUserId { get; set; }
    public string OtherUserFirstName { get; set; } = string.Empty;
    public string OtherUserLastName { get; set; } = string.Empty;
    public string? OtherUserProfilePictureUrl { get; set; }

    public int SeatsReserved { get; set; }
    public BookingStatus Status { get; set; }
}