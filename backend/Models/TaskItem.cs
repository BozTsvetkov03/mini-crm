namespace Backend.Models;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public bool IsDone { get; set; }

    public Guid CustomerId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public Customer Customer { get; set; } = null!;
}