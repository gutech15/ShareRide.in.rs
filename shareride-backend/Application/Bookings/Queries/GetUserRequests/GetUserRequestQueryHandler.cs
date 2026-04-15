using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Queries.GetUserRequests;

public class GetUserRequestsQueryHandler : IRequestHandler<GetUserRequestsQuery, UserRequestsVm>
{
    private readonly IApplicationDbContext _context;

    public GetUserRequestsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserRequestsVm> Handle(GetUserRequestsQuery request, CancellationToken cancellationToken)
    {
        var currentTime = DateTime.UtcNow;

        var bookings = await _context.Bookings
            .Include(b => b.Ride).ThenInclude(r => r.Driver)
            .Include(b => b.Passenger)
            .Where(b => (b.PassengerId == request.UserId || b.Ride.DriverId == request.UserId)
                        && b.Ride.DepartureTime > currentTime)
            .OrderBy(b => b.Ride.DepartureTime)
            .ToListAsync(cancellationToken);

        var vm = new UserRequestsVm();

        foreach (var b in bookings)
        {
            if (b.Ride.DriverId == request.UserId)
            {
                vm.IncomingRequests.Add(new UserRequestDto
                {
                    BookingId = b.Id,
                    RideId = b.RideId,
                    StartCity = b.Ride.StartCity,
                    EndCity = b.Ride.EndCity,
                    DepartureTime = b.Ride.DepartureTime,
                    ArrivalTime = b.Ride.ArrivalTime,
                    OtherUserId = b.PassengerId,
                    OtherUserFirstName = b.Passenger.FirstName,
                    OtherUserLastName = b.Passenger.LastName,
                    OtherUserProfilePictureUrl = b.Passenger.ProfilePictureUrl,
                    SeatsReserved = b.SeatsReserved,
                    Status = b.Status
                });
            }
            else if (b.PassengerId == request.UserId)
            {
                vm.OutgoingRequests.Add(new UserRequestDto
                {
                    BookingId = b.Id,
                    RideId = b.RideId,
                    StartCity = b.Ride.StartCity,
                    EndCity = b.Ride.EndCity,
                    DepartureTime = b.Ride.DepartureTime,
                    ArrivalTime = b.Ride.ArrivalTime,
                    OtherUserId = b.Ride.DriverId,
                    OtherUserFirstName = b.Ride.Driver.FirstName,
                    OtherUserLastName = b.Ride.Driver.LastName,
                    OtherUserProfilePictureUrl = b.Ride.Driver.ProfilePictureUrl,
                    SeatsReserved = b.SeatsReserved,
                    Status = b.Status
                });
            }
        }

        return vm;
    }
}