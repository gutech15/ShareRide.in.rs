using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Reviews.Queries.GetUsersToRate;

public class GetUsersToRateQueryHandler : IRequestHandler<GetUsersToRateQuery, List<UserToRateDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersToRateQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<UserToRateDto>> Handle(GetUsersToRateQuery request, CancellationToken cancellationToken)
    {
        var ride = await _context.Rides
            .Include(r => r.Driver)
            .Include(r => r.Bookings).ThenInclude(b => b.Passenger)
            .Include(r => r.Reviews)
            .FirstOrDefaultAsync(r => r.Id == request.RideId, cancellationToken);

        if (ride == null) throw new KeyNotFoundException("Voznja nije pronadjena.");

        var result = new List<UserToRateDto>();
        bool isDriver = ride.DriverId == request.CurrentUserId;

        var myReviews = ride.Reviews.Where(r => r.ReviewerId == request.CurrentUserId).ToList();

        if (isDriver)
        {
            var approvedPassengers = ride.Bookings
                .Where(b => b.Status == BookingStatus.Approved)
                .Select(b => b.Passenger)
                .ToList();

            foreach (var passenger in approvedPassengers)
            {
                var existingReview = myReviews.FirstOrDefault(r => r.RevieweeId == passenger.Id);
                result.Add(new UserToRateDto
                {
                    UserId = passenger.Id,
                    FirstName = passenger.FirstName,
                    LastName = passenger.LastName,
                    ProfilePictureUrl = passenger.ProfilePictureUrl,
                    IsAlreadyRated = existingReview != null,
                    Rating = existingReview?.Rating,
                    Comment = existingReview?.Comment
                });
            }
        }
        else
        {
            bool isApprovedPassenger = ride.Bookings.Any(b => b.PassengerId == request.CurrentUserId && b.Status == BookingStatus.Approved);
            if (!isApprovedPassenger) throw new UnauthorizedAccessException("Samo odobreni putnici mogu da ocenjuju vozaca.");

            var existingReview = myReviews.FirstOrDefault(r => r.RevieweeId == ride.DriverId);
            result.Add(new UserToRateDto
            {
                UserId = ride.DriverId,
                FirstName = ride.Driver.FirstName,
                LastName = ride.Driver.LastName,
                ProfilePictureUrl = ride.Driver.ProfilePictureUrl,
                IsAlreadyRated = existingReview != null,
                Rating = existingReview?.Rating,
                Comment = existingReview?.Comment
            });
        }

        return result;
    }
}