namespace Backend.Models;

public class Customer
{
    public Guid Id { get; set; }
    public string Name {get; set;} = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public List<TaskItem> Tasks { get; set; } = [];
}