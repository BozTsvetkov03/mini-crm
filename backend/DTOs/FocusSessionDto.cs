namespace Backend.Dtos;

public class FocusSessionDto
{
    public Guid Id { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
}
