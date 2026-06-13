using System.ComponentModel.DataAnnotations;

namespace Backend.Dtos;

public class UserSettingsDto
{
    public string Theme { get; set; } = "light";
    public bool EmailRemindersEnabled { get; set; }
    public int RemindDaysBefore { get; set; } = 3;
    public int DigestHour { get; set; } = 8;
    public string TimeZone { get; set; } = "UTC";
    public bool PublicSpaceEnabled { get; set; }
}

// All fields optional: callers send only what they change (the theme toggle
// sends { theme } alone and must not reset reminder settings)
public class UpdateUserSettingsDto
{
    public string? Theme { get; set; }
    public bool? EmailRemindersEnabled { get; set; }

    [Range(0, 30)]
    public int? RemindDaysBefore { get; set; }

    [Range(0, 23)]
    public int? DigestHour { get; set; }

    public string? TimeZone { get; set; }

    public bool? PublicSpaceEnabled { get; set; }
}
