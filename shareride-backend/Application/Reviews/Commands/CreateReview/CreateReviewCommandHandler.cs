using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Reviews.Commands.CreateReview;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand>
{
    private readonly IApplicationDbContext _context;

    public CreateReviewCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var ride = await _context.Rides
            .Include(r => r.Reviews)
            .FirstOrDefaultAsync(r => r.Id == request.RideId, cancellationToken);

        if (ride == null) throw new KeyNotFoundException("Voznja nije pronadjena.");

        if (DateTime.UtcNow < ride.ArrivalTime)
            throw new InvalidOperationException("Ne mozete oceniti voznju koja se jos nije zavrsila.");

        if (DateTime.UtcNow > ride.ArrivalTime.AddDays(7))
            throw new InvalidOperationException("Rok od 7 dana za ocenjivanje je istekao.");

        bool alreadyRated = ride.Reviews.Any(r => r.ReviewerId == request.ReviewerId && r.RevieweeId == request.RevieweeId);
        if (alreadyRated) throw new InvalidOperationException("Vec ste ocenili ovog korisnika za ovu voznju.");

        var review = new Review
        {
            RideId = request.RideId,
            ReviewerId = request.ReviewerId,
            RevieweeId = request.RevieweeId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);
    }
}