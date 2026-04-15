namespace Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; }
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    public Guid User1Id { get; set; }
    public User User1 { get; set; } = null!;

    public Guid User2Id { get; set; }
    public User User2 { get; set; } = null!;

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}