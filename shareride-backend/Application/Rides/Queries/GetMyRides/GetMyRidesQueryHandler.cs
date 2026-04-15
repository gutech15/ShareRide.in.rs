using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Rides.Queries.GetMyRides;

public class GetMyRidesQueryHandler : IRequestHandler<GetMyRidesQuery, List<MyRideDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMyRidesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyRideDto>> Handle(GetMyRidesQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30); 

        var query = _context.Rides
            .Include(r => r.Driver)
            .Include(r => r.Bookings)
            .Include(r => r.Reviews) 
            .Where(r => r.DriverId == request.UserId ||
                        r.Bookings.Any(b => b.PassengerId == request.UserId && b.Status == BookingStatus.Approved));

        bool isActiveRequest = request.Status.ToLower() == "active";

        if (isActiveRequest)
        {
            query = query.Where(r => r.Status == RideStatus.Active);
            query = query.OrderBy(r => r.DepartureTime);
        }
        else
        {
            query = query.Where(r => (r.Status == RideStatus.Completed || r.Status == RideStatus.Cancelled)
                                  && r.DepartureTime >= thirtyDaysAgo);
            query = query.OrderByDescending(r => r.DepartureTime);
        }

        var rides = await query.ToListAsync(cancellationToken);
        var result = new List<MyRideDto>();

        foreach (var r in rides)
        {
            bool isDriver = r.DriverId == request.UserId;

            bool isFinished = r.Status == RideStatus.Completed && now > r.ArrivalTime;
            bool isWithin7Days = now <= r.ArrivalTime.AddDays(7);
            bool canRate = false;

            if (isFinished && isWithin7Days)
            {
                if (isDriver)
                {
                    var approvedPassengerIds = r.Bookings
                        .Where(b => b.Status == BookingStatus.Approved)
                        .Select(b => b.PassengerId)
                        .ToList();

                    var ratedPassengerIds = r.Reviews
                        .Where(rev => rev.ReviewerId == request.UserId)
                        .Select(rev => rev.RevieweeId)
                        .ToList();

                    canRate = approvedPassengerIds.Except(ratedPassengerIds).Any();
                }
                else
                {
                    bool hasRatedDriver = r.Reviews
                        .Any(rev => rev.ReviewerId == request.UserId && rev.RevieweeId == r.DriverId);

                    canRate = !hasRatedDriver;
                }
            }

            result.Add(new MyRideDto
            {
                RideId = r.Id,
                IsDriver = isDriver,
                DepartureTime = r.DepartureTime,
                ArrivalTime = r.ArrivalTime,
                StartCity = r.StartCity,
                EndCity = r.EndCity,
                DriverId = r.DriverId,
                DriverFirstName = r.Driver.FirstName,
                DriverLastName = r.Driver.LastName,
                DriverProfilePictureUrl = r.Driver.ProfilePictureUrl,
                CanRate = canRate,
                Status = r.Status.ToString()
            });
        }

        return result;
    }
}