using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Users.Queries.GetUserRatings;

public class GetUserRatingsQueryHandler : IRequestHandler<GetUserRatingsQuery, UserRatingsDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserRatingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserRatingsDto> Handle(GetUserRatingsQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .Where(r => r.ReviewerId == request.UserId || r.RevieweeId == request.UserId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = new UserRatingsDto();

        var receivedReviews = reviews.Where(r => r.RevieweeId == request.UserId).ToList();
        result.Received = ProcessReviews(receivedReviews, isReceived: true);

        var givenReviews = reviews.Where(r => r.ReviewerId == request.UserId).ToList();
        result.Given = ProcessReviews(givenReviews, isReceived: false);

        return result;
    }

    private RatingSectionDto ProcessReviews(List<Review> list, bool isReceived)
    {
        var section = new RatingSectionDto
        {
            TotalCount = list.Count,
            AverageRating = list.Any() ? Math.Round(list.Average(r => r.Rating), 1) : 0
        };

        var culture = new System.Globalization.CultureInfo("sr-Latn-RS");

        foreach (var review in list)
        {
            var targetUser = isReceived ? review.Reviewer : review.Reviewee;

            section.Ratings.Add(new RatingDetailsDto
            {
                UserId = targetUser.Id,
                UserName = $"{targetUser.FirstName} {targetUser.LastName}",
                UserImageUrl = targetUser.ProfilePictureUrl,
                Rating = review.Rating,
                Comment = review.Comment,
                DateLabel = review.CreatedAt.ToString("MMMM yyyy", culture)
            });

            if (section.Distribution.ContainsKey(review.Rating))
            {
                section.Distribution[review.Rating]++;
            }
        }

        return section;
    }
}