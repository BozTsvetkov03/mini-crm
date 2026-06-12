using System.Security.Claims;
using Backend.Dtos;
using Backend.Models;
using Backend.Options;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

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

    // HasPassword lets the frontend distinguish Google-created accounts
    // (offer "set a password") from password accounts (offer "change")
    private async Task<object> UserResponseAsync(User user) => new
    {
        user.Id,
        user.Name,
        user.Email,
        HasPassword = await _userManager.HasPasswordAsync(user)
    };

    [HttpPost("register")]
    [IgnoreAntiforgeryToken]
    // [EnableRateLimiting("auth")]
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

        if (!EmailValidator.IsValid(dto.Email.Trim()))
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

        return Ok(await UserResponseAsync(user));
    }

    [HttpPost("login")]
    [IgnoreAntiforgeryToken]
    // [EnableRateLimiting("auth")]
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

        return Ok(await UserResponseAsync(user));
    }

    [HttpPost("forgot-password")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordDto dto,
        [FromServices] IEmailSender emailSender,
        [FromServices] IOptions<EmailOptions> emailOptions,
        [FromServices] ILogger<AuthController> logger)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());

        // Always 204, even for unknown emails or failed sends — the response
        // must not reveal whether an account exists
        if (user?.Email == null)
            return NoContent();

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var baseUrl = emailOptions.Value.AppBaseUrl.TrimEnd('/');
        var resetUrl =
            $"{baseUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(token)}";

        var (subject, html) = PasswordResetEmailComposer.Compose(user.Name, resetUrl);

        try
        {
            await emailSender.SendAsync(user.Email, subject, html);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email");
        }

        return NoContent();
    }

    [HttpPost("reset-password")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token))
            return BadRequest("Invalid or expired reset link");

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest("Password is required");

        if (dto.NewPassword.Length > 128)
            return BadRequest("Password must be 128 characters or less");

        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user == null)
            return BadRequest("Invalid or expired reset link");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "InvalidToken"))
                return BadRequest("Invalid or expired reset link");

            return BadRequest(result.Errors.First().Description);
        }

        return NoContent();
    }

    // Sets a password for Google-created accounts, changes it for the rest
    [HttpPost("password")]
    [Authorize]
    public async Task<IActionResult> SetPassword(SetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest("Password is required");

        if (dto.NewPassword.Length > 128)
            return BadRequest("Password must be 128 characters or less");

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        IdentityResult result;
        if (await _userManager.HasPasswordAsync(user))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return BadRequest("Current password is required");

            result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (result.Errors.Any(e => e.Code == "PasswordMismatch"))
                return BadRequest("Current password is incorrect");
        }
        else
        {
            result = await _userManager.AddPasswordAsync(user, dto.NewPassword);
        }

        if (!result.Succeeded)
            return BadRequest(result.Errors.First().Description);

        // Password changes rotate the security stamp; refresh the cookie so
        // the current session isn't invalidated mid-use
        await _signInManager.RefreshSignInAsync(user);

        return NoContent();
    }

    // Full-page navigation target ("Continue with Google" button), not an
    // XHR call: the whole flow runs on redirects so the browser can visit
    // Google and come back
    [HttpGet("google")]
    public async Task<IActionResult> GoogleLogin(
        [FromServices] IAuthenticationSchemeProvider schemeProvider)
    {
        if (await schemeProvider.GetSchemeAsync(GoogleDefaults.AuthenticationScheme) == null)
            return Redirect("/login?error=google-not-configured");

        var redirectUrl = Url.Action(nameof(GoogleComplete));
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme, redirectUrl);

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    // Where the Google middleware lands after it has exchanged the code and
    // stashed the identity in the external cookie
    [HttpGet("google/complete")]
    public async Task<IActionResult> GoogleComplete()
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
            return Redirect("/login?error=external-auth-failed");

        // Already linked → straight sign-in
        var result = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider, info.ProviderKey, isPersistent: true, bypassTwoFactor: true);

        if (result.Succeeded)
        {
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return Redirect("/app");
        }

        if (result.IsLockedOut)
            return Redirect("/login?error=locked");

        var email = info.Principal.FindFirstValue(ClaimTypes.Email)?.Trim();
        var emailVerified = string.Equals(
            info.Principal.FindFirstValue("email_verified"), "true",
            StringComparison.OrdinalIgnoreCase);

        // Linking by email is only safe when the provider vouches for it;
        // otherwise anyone could claim an existing account via a Google
        // profile with an unverified address
        if (string.IsNullOrWhiteSpace(email) || !emailVerified)
            return Redirect("/login?error=external-email-unverified");

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            var name = info.Principal.FindFirstValue(ClaimTypes.Name)?.Trim();
            if (string.IsNullOrWhiteSpace(name))
                name = email.Split('@')[0];
            if (name.Length > 50)
                name = name[..50];

            user = new User
            {
                UserName = email,
                Email = email,
                Name = name,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
                return Redirect("/login?error=external-auth-failed");
        }

        var linkResult = await _userManager.AddLoginAsync(user, info);
        if (!linkResult.Succeeded)
            return Redirect("/login?error=external-auth-failed");

        await _signInManager.SignInAsync(user, isPersistent: true);
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        return Redirect("/app");
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

        return Ok(await UserResponseAsync(user));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        if (dto.Name.Trim().Length > 50)
            return BadRequest("Name must be 50 characters or less");

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        user.Name = dto.Name.Trim();
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(result.Errors.First().Description);

        return Ok(await UserResponseAsync(user));
    }
}
