using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;

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
            DriverId = request.DriverId!.Value, // Vrednost dobijena iz tokena u kontroleru
            Status = RideStatus.Active 
        };

        _context.Rides.Add(ride);

        await _context.SaveChangesAsync(cancellationToken);

        return ride.Id;
    }
}