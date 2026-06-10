using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Services.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/user-settings")]
[Authorize]
public class UserSettingsController : ControllerBase
{
    private readonly IUserSettingsService _userSettingsService;

    public UserSettingsController(IUserSettingsService userSettingsService)
    {
        _userSettingsService = userSettingsService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<UserSettingsDto>> GetSettings()
    {
        var userId = GetUserId();
        var settings = await _userSettingsService.GetSettingsAsync(userId);
        return Ok(settings);
    }

    [HttpPut]
    public async Task<ActionResult<UserSettingsDto>> UpdateSettings(UpdateUserSettingsDto dto)
    {
        var userId = GetUserId();
        try
        {
            var settings = await _userSettingsService.UpdateSettingsAsync(userId, dto);
            return Ok(settings);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
