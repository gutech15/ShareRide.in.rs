namespace Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int Rating { get; set; } 
    public string Comment { get; set; } = string.Empty;

    public Guid RideId { get; set; }
    public Ride Ride { get; set; } = null!;

    public Guid ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;

    public Guid RevieweeId { get; set; }
    public User Reviewee { get; set; } = null!;
}