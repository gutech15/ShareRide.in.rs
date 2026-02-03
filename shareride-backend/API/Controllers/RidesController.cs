using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Security.Claims;
using Application.Rides.Commands.Create;

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
}