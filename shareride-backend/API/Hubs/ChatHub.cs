using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public async Task OnMessagesSeen(string otherUserId)
    {
        var myId = Context.UserIdentifier;
        await Clients.User(otherUserId).SendAsync("MessagesSeen", myId);
    }
    public async Task NotifyTyping(string receiverId, string senderName)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(receiverId).SendAsync("UserTyping", senderId, senderName);
    }
    public async Task NotifyStoppedTyping(string receiverId)
    {
        var senderId = Context.UserIdentifier;
        await Clients.User(receiverId).SendAsync("UserStoppedTyping", senderId);
    }
}