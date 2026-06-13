using System.Text.Json.Serialization;

namespace Backend.Models;

// A personal notebook page — user-scoped free-form text, distinct from the
// per-customer NoteItem used by the CRM module.
public class NotebookPage
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
