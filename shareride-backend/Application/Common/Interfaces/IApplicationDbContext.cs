using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Ride> Rides { get; set; }
    DbSet<Vehicle> Vehicles { get; set; }
    DbSet<Booking> Bookings { get; set; }
    DbSet<Review> Reviews { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}