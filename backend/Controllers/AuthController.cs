using System.Text.RegularExpressions;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    [IgnoreAntiforgeryToken]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        if (dto.Name.Trim().Length > 50)
            return BadRequest("Name must be 50 characters or less");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        if (dto.Email.Trim().Length > 100)
            return BadRequest("Email must be 100 characters or less");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");

        if (dto.Password.Length > 128)
            return BadRequest("Password must be 128 characters or less");

        if (!IsValidEmail(dto.Email.Trim()))
            return BadRequest("Invalid email");

        var user = new User
        {
            UserName = dto.Email.Trim(),
            Email = dto.Email.Trim(),
            Name = dto.Name.Trim()
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            // Don't reveal whether an email is already registered
            if (result.Errors.Any(e => e.Code == "DuplicateUserName" || e.Code == "DuplicateEmail"))
                return BadRequest("Invalid email");

            var firstError = result.Errors.First().Description;
            return BadRequest(firstError);
        }

        await _signInManager.SignInAsync(user, isPersistent: true);

        return Ok(new { user.Id, user.Name, user.Email });
    }

    [HttpPost("login")]
    [IgnoreAntiforgeryToken]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and password are required");

        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user == null)
            return Unauthorized("Invalid email or password");

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
                return Unauthorized("Account temporarily locked. Try again in a few minutes.");

            return Unauthorized("Invalid email or password");
        }

        await _signInManager.SignInAsync(user, isPersistent: true);

        return Ok(new { user.Id, user.Name, user.Email });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        if (User.Identity?.IsAuthenticated != true)
            return Unauthorized();

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        return Ok(new { user.Id, user.Name, user.Email });
    }

    private static bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$");
    }
}
