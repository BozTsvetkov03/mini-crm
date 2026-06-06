using Backend.Models;

namespace Backend.Dtos;

public class ActivityDto
{
    public ActivityType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public object Data { get; set; } = new { };
}