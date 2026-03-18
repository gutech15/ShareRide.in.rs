using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Rides.Queries.GetRides;

public class GetRidesHandler : IRequestHandler<GetRidesQuery, List<RideSearchDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRidesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RideSearchDto>> Handle(GetRidesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Rides
            .Include(r => r.Driver)
            .ThenInclude(u => u.ReviewsReceived)
            .Include(r => r.Bookings)
            .AsQueryable();

        // 1. Osnovno filtriranje (Gradovi i Datum)
        if (!string.IsNullOrWhiteSpace(request.StartCity))
            query = query.Where(r => r.StartCity.ToLower() == request.StartCity.ToLower());

        if (!string.IsNullOrWhiteSpace(request.EndCity))
            query = query.Where(r => r.EndCity.ToLower() == request.EndCity.ToLower());

        if (request.Date.HasValue)
        {
            var searchDate = request.Date.Value.Date;
            query = query.Where(r => r.DepartureTime.Date == searchDate);
        }

        // 2. Projekcija u RideSearchDto
        return await query
            .Select(r => new RideSearchDto(
                r.Id,
                r.StartCity,
                r.EndCity,
                r.DepartureTime,
                r.ArrivalTime,
                r.PricePerSeat,

                // Kalkulacija slobodnih mesta
                r.AvailableSeats - r.Bookings
                    .Where(b => b.Status == BookingStatus.Approved)
                    .Sum(b => b.SeatsReserved),

                r.IsAutoConfirmation,
                r.DriverId,
                r.Driver.FirstName,
                r.Driver.ProfilePictureUrl,

                // Kalkulacija prosecne ocene (ako nema ocena, vraca 0)
                r.Driver.ReviewsReceived.Any()
                    ? r.Driver.ReviewsReceived.Average(rev => rev.Rating)
                    : 0,

                r.AllowSmoking,
                r.AllowPets,
                r.MaxTwoBackSeats
            ))
            .ToListAsync(cancellationToken);
    }
}