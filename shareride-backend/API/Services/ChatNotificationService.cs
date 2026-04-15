using API.Hubs;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class ChatNotificationService : IChatNotificationService
{
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatNotificationService(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendMessageAsync(Guid receiverId, object message)
    {
        await _hubContext.Clients.User(receiverId.ToString())
            .SendAsync("ReceiveMessage", message);
    }

    public async Task NotifySeenAsync(Guid senderId, Guid readerId)
    {
        await _hubContext.Clients.User(senderId.ToString())
            .SendAsync("MessagesSeen", readerId);
    }
}