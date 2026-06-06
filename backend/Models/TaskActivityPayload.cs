namespace Backend.Models;

public class TaskActivityPayload
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public DateTime? DueDate { get; set; }
}