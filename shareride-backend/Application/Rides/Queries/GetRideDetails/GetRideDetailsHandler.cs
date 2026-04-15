using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Rides.Queries.GetRideDetails;

public class GetRideDetailsHandler : IRequestHandler<GetRideDetailsQuery, RideDetailsDto>
{
    private readonly IApplicationDbContext _context;

    public GetRideDetailsHandler(IApplicationDbContext context) => _context = context;

    public async Task<RideDetailsDto> Handle(GetRideDetailsQuery request, CancellationToken cancellationToken)
    {
        var ride = await _context.Rides
            .Include(r => r.Driver).ThenInclude(u => u.ReviewsReceived)
            .Include(r => r.Bookings).ThenInclude(b => b.Passenger)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (ride == null) throw new KeyNotFoundException("Voznja nije pronadjena.");

        var userBooking = ride.Bookings
        .FirstOrDefault(b => b.PassengerId == request.CurrentUserId);

        return new RideDetailsDto(
            ride.Id,
            ride.StartCity, ride.EndCity,
            ride.StartAddress, ride.EndAddress,
            ride.DepartureTime, ride.ArrivalTime,
            ride.AvailableSeats,
            ride.AvailableSeats - ride.Bookings.Where(b => b.Status == BookingStatus.Approved).Sum(b => b.SeatsReserved),
            ride.PricePerSeat,
            ride.AllowSmoking, ride.AllowPets,
            ride.MaxTwoBackSeats, ride.IsAutoConfirmation,
            ride.DriverId,
            ride.Driver.FirstName,
            ride.Driver.LastName,
            ride.Driver.ProfilePictureUrl,
            ride.Driver.Bio,
            ride.Driver.ReviewsReceived.Any() ? ride.Driver.ReviewsReceived.Average(rev => rev.Rating) : 0,
            ride.Bookings
                .Where(b => b.Status == BookingStatus.Approved)
                .Select(b => new PassengerDto(
                    b.Passenger.Id,
                    b.Passenger.FirstName,
                    b.Passenger.ProfilePictureUrl
                )).ToList(),
            ride.Status,
            userBooking?.Status,
            userBooking?.Id
        );
    }
}