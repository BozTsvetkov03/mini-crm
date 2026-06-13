using Backend.Models;

namespace Backend.Dtos;

// What the public feed exposes about an event: who, what kind, and when —
// plus a focus-session duration. No titles, no bodies, ever.
public class PublicEventDto
{
    public string UserName { get; set; } = string.Empty;
    public UserEventType Type { get; set; }
    public DateTime OccurredAt { get; set; }
    public int? DurationMinutes { get; set; }
}
