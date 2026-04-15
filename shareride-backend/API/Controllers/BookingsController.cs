using Application.Bookings.Commands.AcceptBooking;
using Application.Bookings.Commands.CancelBooking;
using Application.Bookings.Commands.CreateBooking;
using Application.Bookings.Commands.RejectBooking;
using Application.Bookings.Queries.CheckBooking;
using Application.Bookings.Queries.GetUserRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckBooking([FromQuery] Guid rideId, [FromQuery] Guid passengerId)
    {
        var query = new CheckBookingQuery { RideId = rideId, PassengerId = passengerId };
        var hasBooked = await _mediator.Send(query);

        return Ok(hasBooked); 
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingCommand command)
    {
        var bookingId = await _mediator.Send(command);

        return Ok(new { BookingId = bookingId });
    }

    [HttpGet("requests/{userId}")]
    public async Task<IActionResult> GetUserRequests(Guid userId)
    {
        var query = new GetUserRequestsQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPatch("{id}/accept")]
    public async Task<IActionResult> AcceptBooking(Guid id, [FromBody] Guid driverId) 
    {
        var command = new AcceptBookingCommand { BookingId = id, DriverId = driverId };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("{id}/reject")]
    public async Task<IActionResult> RejectBooking(Guid id, [FromBody] Guid driverId)
    {
        var command = new RejectBookingCommand { BookingId = id, DriverId = driverId };
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id, [FromBody] Guid passengerId)
    {
        var command = new CancelBookingCommand { BookingId = id, PassengerId = passengerId };
        await _mediator.Send(command);
        return NoContent();
    }

}