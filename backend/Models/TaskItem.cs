namespace Backend.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public DateTime? DueDate { get; set; }
    public bool IsDone { get; set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
}