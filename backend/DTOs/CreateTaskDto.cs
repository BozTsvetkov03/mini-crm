namespace Backend.Dtos;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
}