using System.Text.Json.Serialization;

namespace Backend.Models;

public class ReminderLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    // The user-local date this digest covered; one digest per user per local day
    public DateOnly DigestDate { get; set; }
    public DateTime SentAt { get; set; }
    public int TaskCount { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;
}
