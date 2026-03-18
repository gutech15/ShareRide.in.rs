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
    // Podaci o vozacu
    Guid DriverId,
    string DriverFirstName,
    string? DriverProfilePictureUrl,
    double AverageRating,
    // Polja za filtriranje na frontendu
    bool AllowSmoking,
    bool AllowPets,
    bool MaxTwoBackSeats
);