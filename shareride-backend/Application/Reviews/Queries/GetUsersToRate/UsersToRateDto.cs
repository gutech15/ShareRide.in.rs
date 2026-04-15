namespace Application.Reviews.Queries.GetUsersToRate;

public class UserToRateDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }

    public bool IsAlreadyRated { get; set; }
    public int? Rating { get; set; }
    public string? Comment { get; set; }
}