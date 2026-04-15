namespace Application.Rides.Queries.GetRides;

public record RideSearchDto(
    Guid Id,
    string StartCity,
    string EndCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    int PricePerSeat,
    int RemainingSeats,
    bool IsAutoConfirmation,
    Guid DriverId,
    string DriverFirstName,
    string? DriverProfilePictureUrl,
    double AverageRating,
    bool AllowSmoking,
    bool AllowPets,
    bool MaxTwoBackSeats
);