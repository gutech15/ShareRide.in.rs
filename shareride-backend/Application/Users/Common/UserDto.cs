namespace Application.Users;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? ProfilePictureUrl,
    string Email,
    string Token
);