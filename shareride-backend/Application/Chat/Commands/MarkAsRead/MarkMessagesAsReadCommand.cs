using Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Application.Chat.Commands.MarkAsRead;

public record MarkMessagesAsReadCommand(Guid UserId, Guid OtherUserId) : IRequest<bool>;

public class MarkMessagesAsReadCommandHandler : IRequestHandler<MarkMessagesAsReadCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IChatNotificationService _notificationService;

    public MarkMessagesAsReadCommandHandler(IApplicationDbContext context, IChatNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(MarkMessagesAsReadCommand request, CancellationToken cancellationToken)
    {
        var unreadMessages = await _context.Messages
            .Where(m => m.SenderId == request.OtherUserId &&
                        m.ReceiverId == request.UserId &&
                        !m.IsRead)
            .ToListAsync(cancellationToken);

        if (!unreadMessages.Any()) return false;

        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _notificationService.NotifySeenAsync(request.OtherUserId, request.UserId);

        return true;
    }
}