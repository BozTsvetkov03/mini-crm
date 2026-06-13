using System.Security.Claims;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/public-space")]
[Authorize]
public class PublicSpaceController : ControllerBase
{
    private readonly IUserEventService _userEvents;

    public PublicSpaceController(IUserEventService userEvents)
    {
        _userEvents = userEvents;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("feed")]
    public async Task<ActionResult<IReadOnlyList<PublicEventDto>>> GetFeed()
    {
        var feed = await _userEvents.GetFeedAsync(GetUserId());

        // Null means the viewer hasn't opted in — viewing is reciprocal.
        if (feed == null)
            return StatusCode(StatusCodes.Status403Forbidden);

        return Ok(feed);
    }
}
