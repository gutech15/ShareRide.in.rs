namespace Application.Rides.Queries.GetMyRides;

public class MyRideDto
{
    public Guid RideId { get; set; }
    public bool IsDriver { get; set; }

    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public string StartCity { get; set; } = string.Empty;
    public string EndCity { get; set; } = string.Empty;

    public Guid DriverId { get; set; }
    public string DriverFirstName { get; set; } = string.Empty;
    public string DriverLastName { get; set; } = string.Empty;
    public string? DriverProfilePictureUrl { get; set; }

    public bool CanRate { get; set; }
    public string? Status { get; set; }
}