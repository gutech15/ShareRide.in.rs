namespace Application.Chat.Queries.GetConversations;

public record ConversationDto(
    Guid Id,
    Guid OtherUserId,
    string OtherUserName,
    string? OtherUserPictureUrl,
    string LastMessageSnippet,
    DateTime LastMessageAt,
    int UnreadCount 
);