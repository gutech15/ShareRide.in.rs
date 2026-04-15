using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Users.Commands.UpdateProfile;

public class UpdateUserProfileCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }

    public IFormFile? ProfilePicture { get; set; }

    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleColor { get; set; }
    public string? VehicleLicensePlate { get; set; }
    public bool DeleteVehicle { get; set; }
}