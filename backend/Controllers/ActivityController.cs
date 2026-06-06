using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Models;
using Backend.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/activities")]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _db;

    public ActivityController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("{customerId}")]
    public async Task<IEnumerable<ActivityDto>> Get(Guid customerId)
    {
        var activities = await _db.Activities
        .Where(a => a.CustomerId == customerId)
        .OrderByDescending(a => a.CreatedAt)
        .ToListAsync();

        return activities.Select(Map).ToList();
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