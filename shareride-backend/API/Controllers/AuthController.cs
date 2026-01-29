using Application.Users;
using Application.Users.Commands.Login;
using Application.Users.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterUserCommand command)
    {
        return Ok(await _mediator.Send(command));
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginCommand command)
    {
        return Ok(await _mediator.Send(command));
    }
}