namespace Backend.Models;

public class Activity
{
    public Guid Id { get; set; }

    public ActivityType Type { get; set; }

    public Customer Customer { get; set; } 
    public Guid CustomerId { get; set; }

    public DateTime CreatedAt { get; set; }

    // Flexible payload depending on type
    public required string PayloadJson { get; set; }
}