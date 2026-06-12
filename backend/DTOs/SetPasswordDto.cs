namespace Backend.Dtos;

public class SetPasswordDto
{
    // Required only when the user already has a password
    public string? CurrentPassword { get; set; }
    public string NewPassword { get; set; } = string.Empty;
}
