using Domain.Enums;

namespace Domain.Entities;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid RideId { get; set; }
    public Ride Ride { get; set; } = null!;

    public Guid PassengerId { get; set; }
    public User Passenger { get; set; } = null!;

    public int SeatsReserved { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
}