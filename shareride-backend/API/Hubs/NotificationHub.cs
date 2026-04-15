using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class NotificationHub : Hub
{
    public override Task OnConnectedAsync()
    {
        Console.WriteLine($"Klijent povezan na NotificationHub: {Context.ConnectionId}");
        return base.OnConnectedAsync();
    }
}