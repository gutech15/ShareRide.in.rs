using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Ride> Rides { get; set; }
    DbSet<Vehicle> Vehicles { get; set; }
    DbSet<Booking> Bookings { get; set; }
    DbSet<Review> Reviews { get; set; }
    DbSet<Notification> Notifications { get; set; }
    DbSet<Conversation> Conversations { get; set; }
    DbSet<Message> Messages { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}