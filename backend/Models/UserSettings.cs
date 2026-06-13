using System.Text.Json.Serialization;

namespace Backend.Models;

public class UserSettings
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Theme { get; set; } = "light";
    public bool EmailRemindersEnabled { get; set; }
    public int RemindDaysBefore { get; set; } = 3;
    public int DigestHour { get; set; } = 8;
    public string TimeZone { get; set; } = "UTC";

    // Public space is opt-in and off by default.
    public bool PublicSpaceEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;
}
