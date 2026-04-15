namespace Application.Chat.Queries;

public record MessageDto(
    Guid Id,
    string Content,
    DateTime SentAt,
    Guid SenderId,
    bool IsRead
);