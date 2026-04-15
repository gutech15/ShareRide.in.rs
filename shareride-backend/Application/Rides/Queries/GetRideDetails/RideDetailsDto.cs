using Domain.Enums;

namespace Application.Rides.Queries.GetRideDetails;

public record RideDetailsDto(
    Guid Id,
    string StartCity, string EndCity,
    string StartAddress, string EndAddress,
    DateTime DepartureTime, DateTime ArrivalTime,
    int TotalSeats, int RemainingSeats,
    int PricePerSeat,
    bool AllowSmoking, bool AllowPets,
    bool MaxTwoBackSeats, bool IsAutoConfirmation,
    Guid DriverId,
    string DriverFirstName,
    string DriverLastName,
    string? DriverProfilePictureUrl,
    string? DriverBio,
    double DriverAverageRating,
    List<PassengerDto> Passengers,
    RideStatus Status,
    BookingStatus? CurrentUserBookingStatus,
    Guid? CurrentUserBookingId
);

public record PassengerDto(
    Guid Id,
    string FirstName,
    string? ProfilePictureUrl
);