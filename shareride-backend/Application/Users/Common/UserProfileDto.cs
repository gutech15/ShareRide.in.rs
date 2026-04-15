namespace Application.Common.Users;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? Bio { get; set; }
    public int Age { get; set; }
    public DateTime MemberSince { get; set; }
    public double AverageRating { get; set; }
    public int RatingsCount { get; set; }
    public int CompletedRidesCount { get; set; }
    public string ExperienceLevel { get; set; } = string.Empty;

    public string? VehicleInfo { get; set; }

    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleColor { get; set; }
    public string? VehicleLicensePlate { get; set; }
}