using Application.Rides.Commands.Create;
using Application.Rides.Queries.GetRideDetails;
using Application.Rides.Queries.GetRides;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class RidesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RidesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRide([FromBody] CreateRideCommand command)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null) return Unauthorized();

        var resultId = await _mediator.Send(command with { DriverId = Guid.Parse(userIdClaim.Value) });

        return Ok(resultId);
    }

    [HttpGet]
    public async Task<ActionResult<List<RideSearchDto>>> GetRides(
    [FromQuery] string? startCity,
    [FromQuery] string? endCity,
    [FromQuery] DateTime? date)
    {
        var query = new GetRidesQuery(startCity, endCity, date);
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RideDetailsDto>> GetRideDetails(Guid id)
    {
        return Ok(await _mediator.Send(new GetRideDetailsQuery(id)));
    }
}