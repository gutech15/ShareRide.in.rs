using API.Hubs;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(Guid notificationId, Guid userId, string message, string actionUrl)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
        {
            Id = notificationId,
            Message = message,
            ActionUrl = actionUrl,
            CreatedAt = DateTime.UtcNow
        });
    }

}