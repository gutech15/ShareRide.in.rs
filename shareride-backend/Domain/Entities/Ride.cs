using Domain.Enums;

namespace Domain.Entities;

public class Ride
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string StartCity { get; set; } = string.Empty;
    public string EndCity { get; set; } = string.Empty;
    public string StartAddress { get; set; } = string.Empty;
    public string EndAddress { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public int AvailableSeats { get; set; }
    public int PricePerSeat { get; set; } 

    public bool AllowSmoking { get; set; }
    public bool AllowPets { get; set; }
    public bool MaxTwoBackSeats { get; set; }
    public bool IsAutoConfirmation { get; set; }

    public RideStatus Status { get; set; } = RideStatus.Active;

    public Guid DriverId { get; set; }
    public User Driver { get; set; } = null!;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}