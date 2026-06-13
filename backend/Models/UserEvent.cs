using System.Text.Json.Serialization;

namespace Backend.Models;

// Deliberately content-free: a public-space event records the *act*, never the
// *content*. There is no title/body column, so private note or task text can
// never leak through this table. DurationMinutes is the only payload and is
// only set for focus sessions.
public class UserEvent
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;

    public UserEventType Type { get; set; }
    public DateTime OccurredAt { get; set; }

    public int? DurationMinutes { get; set; }
}
