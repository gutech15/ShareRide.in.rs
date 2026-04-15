using Application.Common.Users;
using Application.Users.Commands.UpdateProfile;
using Application.Users.Queries.GetUserProfile;
using Application.Users.Queries.GetUserRatings;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id}/profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid id)
    {
        var query = new GetUserProfileQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = "Korisnik nije pronadjen." });
        }

        return Ok(result);
    }

    [HttpPut("{id}/profile")]
    [Consumes("multipart/form-data")] 
    public async Task<IActionResult> UpdateProfile(Guid id, [FromForm] UpdateUserProfileCommand command)
    {
        command.UserId = id;

        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { message = "Korisnik nije pronadjen." });
        }

        var updatedProfile = await _mediator.Send(new GetUserProfileQuery(id));

        return Ok(updatedProfile);
    }

    [HttpGet("{id}/ratings")]
    public async Task<IActionResult> GetUserRatings(Guid id)
    {
        var query = new GetUserRatingsQuery(id);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}