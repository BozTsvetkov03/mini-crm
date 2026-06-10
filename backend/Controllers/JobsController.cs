using System.Security.Cryptography;
using System.Text;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

// Machine-to-machine endpoints triggered by the scheduled GitHub Actions workflow.
// Authenticated by a shared secret header, not cookies — hence no antiforgery.
[ApiController]
[Route("api/jobs")]
[AllowAnonymous]
[IgnoreAntiforgeryToken]
public class JobsController : ControllerBase
{
    private readonly IReminderDigestService _digestService;
    private readonly IConfiguration _config;

    public JobsController(IReminderDigestService digestService, IConfiguration config)
    {
        _digestService = digestService;
        _config = config;
    }

    [HttpPost("send-reminders")]
    public async Task<IActionResult> SendReminders(CancellationToken ct)
    {
        var secret = _config["Jobs:CronSecret"];
        if (string.IsNullOrWhiteSpace(secret))
            return StatusCode(503, new { error = "Jobs__CronSecret is not configured." });

        var provided = Request.Headers["X-Cron-Secret"].ToString();
        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(secret),
                Encoding.UTF8.GetBytes(provided)))
            return Unauthorized();

        var result = await _digestService.RunAsync(ct);
        return Ok(result);
    }
}
