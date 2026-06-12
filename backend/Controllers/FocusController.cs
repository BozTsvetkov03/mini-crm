using System.Security.Claims;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/focus")]
[Authorize]
public class FocusController : ControllerBase
{
    private readonly IFocusSessionService _focusService;

    public FocusController(IFocusSessionService focusService)
    {
        _focusService = focusService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("sessions")]
    public async Task<ActionResult<FocusSessionDto>> CreateSession(CreateFocusSessionDto dto)
    {
        if (dto.DurationMinutes < 1 || dto.DurationMinutes > 240)
            return BadRequest("Duration must be between 1 and 240 minutes");

        var session = await _focusService.CreateAsync(GetUserId(), dto.DurationMinutes);
        return Ok(session);
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<IEnumerable<FocusSessionDto>>> GetSessions([FromQuery] DateTimeOffset from)
    {
        var sessions = await _focusService.GetSinceAsync(GetUserId(), from.UtcDateTime);
        return Ok(sessions);
    }
}
