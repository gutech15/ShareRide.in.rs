using Application.Notifications.Commands.MarkAsRead;
using Application.Notifications.Queries.GetNotifications;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications(Guid userId)
    {
        var notifications = await _mediator.Send(new GetNotificationsQuery(userId));
        return Ok(notifications);
    }

    [HttpPatch("{id}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _mediator.Send(new MarkAsReadCommand(id));
        return NoContent();
    }
}