using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Chat.Queries.GetMessages;

public record GetMessagesQuery(Guid UserId, Guid OtherUserId) : IRequest<List<MessageDto>>;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<MessageDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMessagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var conversationId = await _context.Conversations
            .Where(c => (c.User1Id == request.UserId && c.User2Id == request.OtherUserId) ||
                        (c.User1Id == request.OtherUserId && c.User2Id == request.UserId))
            .Select(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (conversationId == Guid.Empty) return new List<MessageDto>();

        return await _context.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageDto(m.Id, m.Content, m.SentAt, m.SenderId, m.IsRead))
            .ToListAsync(cancellationToken);
    }
}