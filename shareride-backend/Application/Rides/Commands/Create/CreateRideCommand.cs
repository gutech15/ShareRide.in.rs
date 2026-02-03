using Domain.Enums;
using MediatR;

namespace Application.Rides.Commands.Create;

public record CreateRideCommand(
    string StartCity,
    string EndCity,
    string StartAddress,
    string EndAddress,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    int AvailableSeats,
    int PricePerSeat,
    bool AllowSmoking,
    bool AllowPets,
    bool MaxTwoBackSeats,
    bool IsAutoConfirmation,
    Guid? DriverId = null 
) : IRequest<Guid>;