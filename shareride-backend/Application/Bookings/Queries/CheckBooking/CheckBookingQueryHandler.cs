using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Bookings.Queries.CheckBooking;

public class CheckBookingQueryHandler : IRequestHandler<CheckBookingQuery, bool>
{
    private readonly IApplicationDbContext _context;

    public CheckBookingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(CheckBookingQuery request, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .AnyAsync(b => b.RideId == request.RideId
                        && b.PassengerId == request.PassengerId
                        && (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Approved),
                      cancellationToken);
    }
}