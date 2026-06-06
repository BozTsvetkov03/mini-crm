using System.Text.Json;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;

public class ActivityService : IActivityService
{
    private readonly AppDbContext _db;

    public ActivityService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateAsync(Activity activity)
    {
        _db.Activities.Add(activity);
        await _db.SaveChangesAsync();
    }

    private ActivityDto Map(Activity activity)
    {
        return activity.Type switch
        {
            ActivityType.NoteCreated or ActivityType.NoteEdited => new ActivityDto
            {
                Type = activity.Type,
                Title = activity.Type == ActivityType.NoteCreated ? "Note added" : "Note edited",
                Icon = "📝",
                CreatedAt = activity.CreatedAt,
                Data = JsonSerializer.Deserialize<object>(activity.PayloadJson)
            },

            ActivityType.TaskCreated or ActivityType.TaskEdited or ActivityType.TaskCompleted => new ActivityDto
            {
                Type = activity.Type,
                Title = activity.Type switch
                {
                    ActivityType.TaskCreated => "Task created",
                    ActivityType.TaskEdited => "Task updated",
                    ActivityType.TaskCompleted => "Task completed",
                    _ => "Task activity"
                },
                Icon = "🎯",
                CreatedAt = activity.CreatedAt,
                Data = JsonSerializer.Deserialize<object>(activity.PayloadJson)
            },

            _ => new ActivityDto
            {
                Type = activity.Type,
                Title = "Activity",
                Icon = "📌",
                CreatedAt = activity.CreatedAt,
                Data = new { }
            }
        };
    }
}