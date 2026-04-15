using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Application.Users.Commands.UpdateProfile;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public UpdateUserProfileCommandHandler(IApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<bool> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.Vehicle)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null) return false;

        if (!string.IsNullOrWhiteSpace(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrWhiteSpace(request.LastName)) user.LastName = request.LastName;
        user.Bio = request.Bio;

        if (request.ProfilePicture != null && request.ProfilePicture.Length > 0)
        {
            try
            {
                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsFolder = Path.Combine(webRootPath, "images", "profiles");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
                {
                    var oldPath = Path.Combine(webRootPath, user.ProfilePictureUrl.TrimStart('/'));
                    if (File.Exists(oldPath))
                    {
                        try { File.Delete(oldPath); } catch { /* Ignorisemo ako je fajl zakljucan */ }
                    }
                }

                var extension = Path.GetExtension(request.ProfilePicture.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await request.ProfilePicture.CopyToAsync(fileStream, cancellationToken);
                }

                user.ProfilePictureUrl = $"/images/profiles/{uniqueFileName}";
            }
            catch (Exception ex)
            {
                throw new Exception($"Greska pri upisu na disk: {ex.Message}. Putanja: {request.ProfilePicture.FileName}");
            }
        }

        // 4. Obrada vozila
        if (request.DeleteVehicle)
        {
            if (user.Vehicle != null)
            {
                _context.Vehicles.Remove(user.Vehicle);
                user.Vehicle = null;
            }
        }
        else if (!string.IsNullOrWhiteSpace(request.VehicleMake))
        {
            if (user.Vehicle == null)
            {
                user.Vehicle = new Vehicle { UserId = user.Id };
                _context.Vehicles.Add(user.Vehicle);
            }

            user.Vehicle.Make = request.VehicleMake;
            user.Vehicle.Model = request.VehicleModel ?? "";
            user.Vehicle.Color = request.VehicleColor ?? "";
            user.Vehicle.LicensePlate = request.VehicleLicensePlate ?? "";
        }

        // 5. Čuvanje u bazu
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"Baza podataka je odbila snimanje: {ex.Message}");
        }
    }
}