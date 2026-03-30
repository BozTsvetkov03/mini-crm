using System.Text.Json.Serialization;

namespace Backend.Models;

public class Customer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Company { get; set; }

    public Guid OwnerId { get; set; }

    [JsonIgnore]
    public User Owner { get; set; } = null!;

    [JsonIgnore]
    public List<TaskItem> Tasks { get; set; } = [];

    [JsonIgnore]
    public List<NoteItem> Notes { get; set; } = [];
}