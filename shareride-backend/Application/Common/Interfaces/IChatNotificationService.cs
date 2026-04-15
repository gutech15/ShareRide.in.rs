namespace Application.Common.Interfaces;

public interface IChatNotificationService
{
    Task SendMessageAsync(Guid receiverId, object message);
    Task NotifySeenAsync(Guid senderId, Guid readerId);
}