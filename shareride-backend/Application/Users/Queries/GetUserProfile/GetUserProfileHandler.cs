using Application.Common.Interfaces;
using Application.Common.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Users.Queries.GetUserProfile;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto?>
{
    private readonly IApplicationDbContext _context;

    public GetUserProfileHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {

        var now = DateTime.UtcNow;

        var user = await _context.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.RidesAsDriver)
            .Include(u => u.Vehicle)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null) return null;

        var age = now.Year - user.DateOfBirth.Year;
        if (user.DateOfBirth.Date > now.AddYears(-age)) age--;

        var completedRides = user.RidesAsDriver.Count(r => r.ArrivalTime < now);
        var avgRating = user.ReviewsReceived.Any() ? user.ReviewsReceived.Average(r => r.Rating) : 0;

        string vehicleString = string.Empty;
        if (user.Vehicle != null)
        {
            var parts = new List<string?> { user.Vehicle.Make, user.Vehicle.Model, user.Vehicle.Color };
            vehicleString = string.Join(" ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
        }

        return new UserProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Age = age,
            MemberSince = user.CreatedAt,
            AverageRating = Math.Round(avgRating, 1),
            RatingsCount = user.ReviewsReceived.Count,
            CompletedRidesCount = completedRides,
            ExperienceLevel = completedRides >= 10 ? "Iskusan" : "Pocetnik",

            VehicleInfo = string.IsNullOrWhiteSpace(vehicleString) ? null : vehicleString,
            VehicleMake = user.Vehicle?.Make,
            VehicleModel = user.Vehicle?.Model,
            VehicleColor = user.Vehicle?.Color,
            VehicleLicensePlate = user.Vehicle?.LicensePlate
        };
    }
}