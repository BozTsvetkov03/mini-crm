namespace Backend.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name {get; set;} = "";
    public string Email { get; set; } = "";
    public string Country { get; set; } = "";

    public List<TaskItem> Tasks { get; set; } = [];
}