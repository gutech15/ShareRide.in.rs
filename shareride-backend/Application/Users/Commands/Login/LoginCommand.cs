using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Users.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<UserDto>;

public class LoginHandler : IRequestHandler<LoginCommand, UserDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public LoginHandler(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<UserDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null) throw new Exception("Nema korisnika sa tom mejl adresom.");

        var result = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!result) throw new Exception("Uneli ste neispravnu lozinku.");

        return new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email!,
            _tokenService.CreateToken(user)
        );
    }
}