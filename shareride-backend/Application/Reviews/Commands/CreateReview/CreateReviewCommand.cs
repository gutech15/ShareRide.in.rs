using MediatR;

namespace Application.Reviews.Commands.CreateReview;

public class CreateReviewCommand : IRequest
{
    public Guid RideId { get; set; }
    public Guid ReviewerId { get; set; } 
    public Guid RevieweeId { get; set; } 
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}