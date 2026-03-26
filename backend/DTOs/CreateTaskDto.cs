namespace Backend.Dtos;

public class CreateTaskDto
{
    public string Title { get; set; } = "";
    public DateTime? DueDate { get; set; }
}