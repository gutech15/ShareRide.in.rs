using API.Hubs; 
using Application.Chat.Commands.SendMessage;
using Application.Chat.Commands.MarkAsRead;
using Application.Chat.Queries.GetMessages;
using Application.Chat.Queries.GetConversations;
using Application.Chat.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR; 
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHubContext<ChatHub> _hubContext; 

    public ChatController(IMediator mediator, IHubContext<ChatHub> hubContext)
    {
        _mediator = mediator;
        _hubContext = hubContext;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var senderIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(senderIdClaim) || !Guid.TryParse(senderIdClaim, out Guid senderId))
        {
            return Unauthorized("Neispravan token ili korisnik nije pronadjen.");
        }

        var command = new SendMessageCommand(senderId, request.ReceiverId, request.Content);
        var messageDto = await _mediator.Send(command);

        await _hubContext.Clients.User(request.ReceiverId.ToString())
            .SendAsync("ReceiveMessage", messageDto);

        return Ok(messageDto);
    }

    [HttpGet("history/{otherUserId}")]
    public async Task<IActionResult> GetChatHistory(Guid otherUserId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized();
        }

        var query = new GetMessagesQuery(userId, otherUserId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized();
        }

        var query = new GetConversationsQuery(userId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPut("mark-read/{otherUserId}")]
    public async Task<IActionResult> MarkAsRead(Guid otherUserId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized();
        }

        var command = new MarkMessagesAsReadCommand(userId, otherUserId);
        var result = await _mediator.Send(command);

        if (result) 
        {
            await _hubContext.Clients.User(otherUserId.ToString())
                .SendAsync("MessagesSeen", userId);
        }

        return Ok();
    }
}
public record SendMessageRequest(Guid ReceiverId, string Content);