using Application.Chat.Queries;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Application.Chat.Commands.SendMessage;

public record SendMessageCommand(Guid SenderId, Guid ReceiverId, string Content) : IRequest<MessageDto>;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, MessageDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IChatNotificationService _notificationService;

    public SendMessageCommandHandler(IApplicationDbContext context, IChatNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c =>
                (c.User1Id == request.SenderId && c.User2Id == request.ReceiverId) ||
                (c.User1Id == request.ReceiverId && c.User2Id == request.SenderId),
                cancellationToken);

        if (conversation == null)
        {
            conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                User1Id = request.SenderId,
                User2Id = request.ReceiverId,
                LastMessageAt = DateTime.UtcNow
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            conversation.LastMessageAt = DateTime.UtcNow;
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            Content = request.Content,
            SenderId = request.SenderId,
            ReceiverId = request.ReceiverId,
            ConversationId = conversation.Id,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new MessageDto(message.Id, message.Content, message.SentAt, message.SenderId, message.IsRead);

        await _notificationService.SendMessageAsync(request.ReceiverId, dto);

        return dto;
    }
}