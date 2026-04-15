namespace Application.Users.Queries.GetUserRatings;

public class UserRatingsDto
{
    public RatingSectionDto Received { get; set; } = new();
    public RatingSectionDto Given { get; set; } = new();
}

public class RatingSectionDto
{
    public double AverageRating { get; set; }
    public int TotalCount { get; set; }
    public Dictionary<int, int> Distribution { get; set; } = new()
    {
        {5, 0}, {4, 0}, {3, 0}, {2, 0}, {1, 0}
    };
    public List<RatingDetailsDto> Ratings { get; set; } = new();
}

public class RatingDetailsDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserImageUrl { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string DateLabel { get; set; } = string.Empty; 
}