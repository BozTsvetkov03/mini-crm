using System.Text.Json.Serialization;

namespace Backend.Models;

public class FocusSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;

    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
}
