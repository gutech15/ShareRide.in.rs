namespace Application.Users;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Token
);