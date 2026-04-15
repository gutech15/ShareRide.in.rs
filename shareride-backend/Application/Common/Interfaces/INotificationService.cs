namespace Application.Common.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(Guid notificationId, Guid userId, string message, string actionUrl);
}