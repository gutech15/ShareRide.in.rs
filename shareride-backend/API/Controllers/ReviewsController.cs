using Application.Reviews.Commands.CreateReview;
using Application.Reviews.Queries.GetUsersToRate;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("users-to-rate/{rideId}/{currentUserId}")]
    public async Task<IActionResult> GetUsersToRate(Guid rideId, Guid currentUserId)
    {
        var query = new GetUsersToRateQuery { RideId = rideId, CurrentUserId = currentUserId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand command)
    {
        await _mediator.Send(command);
        return Ok();
    }
}