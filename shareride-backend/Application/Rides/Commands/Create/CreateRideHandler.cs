using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Rides.Commands.Create;

public class CreateRideHandler : IRequestHandler<CreateRideCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateRideHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateRideCommand request, CancellationToken cancellationToken)
    {
        if (request.ArrivalTime <= request.DepartureTime)
        {
            throw new InvalidOperationException("Vreme dolaska mora biti nakon vremena polaska.");
        }

        var bufferStart = request.DepartureTime.AddMinutes(-30);
        var bufferEnd = request.ArrivalTime.AddMinutes(30);

        var hasRideOverlap = await _context.Rides
            .AnyAsync(r => r.DriverId == request.DriverId!.Value
                        && r.Status == RideStatus.Active 
                        && bufferEnd > r.DepartureTime
                        && bufferStart < r.ArrivalTime,
                cancellationToken);

        if (hasRideOverlap)
        {
            throw new InvalidOperationException("Vec imate zakazanu voznju u ovom periodu. Potrebno je ostaviti bar 30 minuta pauze izmedju voznji.");
        }

        var hasBookingOverlap = await _context.Bookings
        .Include(b => b.Ride)
        .AnyAsync(b => b.PassengerId == request.DriverId!.Value &&
                       (b.Status == BookingStatus.Approved || b.Status == BookingStatus.Pending) &&
                       b.Ride.Status == RideStatus.Active &&
                       b.Ride.DepartureTime <= bufferEnd &&
                       b.Ride.ArrivalTime >= bufferStart,
            cancellationToken);

        if (hasBookingOverlap)
        {
            throw new InvalidOperationException("Ne možete kreirati vožnju jer ste u tom periodu (+-30 min) prijavljeni kao putnik na drugoj vožnji.");
        }

        var ride = new Ride
        {
            StartCity = request.StartCity,
            EndCity = request.EndCity,
            StartAddress = request.StartAddress,
            EndAddress = request.EndAddress,
            DepartureTime = request.DepartureTime,
            ArrivalTime = request.ArrivalTime,
            AvailableSeats = request.AvailableSeats,
            PricePerSeat = request.PricePerSeat,
            AllowSmoking = request.AllowSmoking,
            AllowPets = request.AllowPets,
            MaxTwoBackSeats = request.MaxTwoBackSeats,
            IsAutoConfirmation = request.IsAutoConfirmation,
            DriverId = request.DriverId!.Value,
            Status = RideStatus.Active 
        };

        _context.Rides.Add(ride);

        await _context.SaveChangesAsync(cancellationToken);

        return ride.Id;
    }
}