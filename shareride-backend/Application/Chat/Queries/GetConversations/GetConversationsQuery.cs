using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Chat.Queries.GetConversations;

public record GetConversationsQuery(Guid UserId) : IRequest<List<ConversationDto>>;

public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetConversationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var conversations = await _context.Conversations
            .Where(c => c.User1Id == request.UserId || c.User2Id == request.UserId)
            .Select(c => new
            {
                Conversation = c,
                OtherUser = c.User1Id == request.UserId ? c.User2 : c.User1,
                LastMessage = _context.Messages
                    .Where(m => m.ConversationId == c.Id)
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefault(),
                UnreadCount = _context.Messages
                    .Count(m => m.ConversationId == c.Id && !m.IsRead && m.SenderId != request.UserId)
            })
            .OrderByDescending(c => c.Conversation.LastMessageAt)
            .ToListAsync(cancellationToken);

        return conversations.Select(x => new ConversationDto(
            x.Conversation.Id,
            x.OtherUser.Id,
            $"{x.OtherUser.FirstName} {x.OtherUser.LastName}",
            x.OtherUser.ProfilePictureUrl,
            GetSnippet(x.LastMessage?.Content),
            x.Conversation.LastMessageAt,
            x.UnreadCount
        )).ToList();
    }

    private static string GetSnippet(string? content)
    {
        if (string.IsNullOrEmpty(content)) return string.Empty;
        return content.Length > 20 ? content.Substring(0, 20) + "..." : content;
    }
}