namespace Backend.Models;

public class NoteItem
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Guid CustomerId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public Customer Customer { get; set; } = null!;
}
