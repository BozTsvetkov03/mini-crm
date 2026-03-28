namespace Backend.Dtos;

public class UpdateTaskDto
{
    public string Title { get; set; } = "";
    public DateTime? DueDate { get; set; }

    public bool IsDone { get; set; }
}