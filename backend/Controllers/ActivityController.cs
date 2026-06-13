using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/activities")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{customerId:guid}")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> Get(Guid customerId)
    {
        var userId = GetUserId();
        var activities = await _activityService.GetByCustomerAsync(customerId, userId);

        if (activities == null)
            return NotFound("Customer not found");

        return Ok(activities);
    }
}
