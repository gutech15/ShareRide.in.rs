using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundServices;

public class RideStatusWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RideStatusWorker> _logger;

    public RideStatusWorker(IServiceProvider serviceProvider, ILogger<RideStatusWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Ride Status Worker je pokrenut.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("********** Status Worker u Akciji - Provera voznji u toku... **********");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    var now = DateTime.UtcNow;

                    var ridesToComplete = await context.Rides
                        .Include(r => r.Bookings) 
                        .Where(r => r.Status == RideStatus.Active && r.ArrivalTime <= now)
                        .ToListAsync(stoppingToken);

                    if (ridesToComplete.Any())
                    {
                        _logger.LogInformation("Pronadjeno {Count} voznji za arhiviranje.", ridesToComplete.Count);
                        var notificationsToSend = new List<Notification>();

                        foreach (var ride in ridesToComplete)
                        {
                            ride.Status = RideStatus.Completed;

                            var approvedPassengers = ride.Bookings.Where(b => b.Status == BookingStatus.Approved).ToList();

                            if (approvedPassengers.Any())
                            {
                                string actionUrl = $"/rate-ride/{ride.Id}";
                                string msg = "Voznja je zavrsena! Ocenite svoje saputnike.";

                                var driverNote = new Notification { UserId = ride.DriverId, Message = msg, ActionUrl = actionUrl };
                                context.Notifications.Add(driverNote);
                                notificationsToSend.Add(driverNote);

                                foreach (var booking in approvedPassengers)
                                {
                                    var passengerNote = new Notification { UserId = booking.PassengerId, Message = msg, ActionUrl = actionUrl };
                                    context.Notifications.Add(passengerNote);
                                    notificationsToSend.Add(passengerNote);
                                }
                            }
                        }

                        await context.SaveChangesAsync(stoppingToken);

                        foreach (var note in notificationsToSend)
                        {
                            await notificationService.SendNotificationAsync(note.Id, note.UserId, note.Message, note.ActionUrl);
                        }

                        _logger.LogInformation("Zavrseno arhiviranje voznji i kreiranje notifikacija.");
                    }
                    else
                    {
                        _logger.LogInformation("Nije bilo voznji za promenu statusa...");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Doslo je do greske prilikom azuriranja statusa voznji.");
            }

            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}