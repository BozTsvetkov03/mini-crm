using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    private readonly IActivityService _activityService;
    private readonly IUserEventService _userEvents;

    public TaskService(AppDbContext db, IActivityService activityService, IUserEventService userEvents)
    {
        _db = db;
        _activityService = activityService;
        _userEvents = userEvents;
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByCustomerAsync(Guid customerId, Guid userId)
    {
        return await _db.Tasks
            .Where(t => t.CustomerId == customerId && t.Customer.OwnerId == userId)
            .OrderBy(t => t.IsDone)
            .ThenBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<CalendarTaskDto>> GetTasksForCalendarAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _db.Tasks
            .Where(t => t.Customer.OwnerId == userId
                && t.DueDate != null
                && t.DueDate >= from
                && t.DueDate < to)
            .OrderBy(t => t.DueDate)
            .Select(t => new CalendarTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsDone = t.IsDone,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer.Name
            })
            .ToListAsync();
    }

    public async Task<TaskItem?> GetTaskByIdAsync(Guid id, Guid userId)
    {
        return await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);
    }

    public async Task<TaskItem?> CreateTaskAsync(Guid customerId, CreateTaskDto dto, Guid userId)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == customerId && c.OwnerId == userId);

        if (!customerExists)
            return null;

        var now = DateTime.UtcNow;

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            DueDate = dto.DueDate,
            IsDone = false,
            CustomerId = customerId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        await _activityService.CreateAsync(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.TaskCreated,
            CustomerId = customerId,
            CreatedAt = now,
            PayloadJson = JsonSerializer.Serialize(new
            {
                Name = task.Title,
                DueDate = task.DueDate
            })
        });

        await _userEvents.RecordAsync(userId, UserEventType.TaskCreated);

        return task;
    }

    public async Task<TaskItem?> UpdateTaskAsync(Guid id, UpdateTaskDto dto, Guid userId)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return null;

        var wasDone = task.IsDone;
        task.Title = dto.Title.Trim();
        task.DueDate = dto.DueDate;
        task.IsDone = dto.IsDone;

        if (!wasDone && dto.IsDone)
            task.CompletedAt = DateTime.UtcNow;
        else if (wasDone && !dto.IsDone)
            task.CompletedAt = null;

        await _db.SaveChangesAsync();

        await _activityService.CreateAsync(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.TaskEdited,
            CustomerId = task.CustomerId,
            CreatedAt = DateTime.UtcNow,
            PayloadJson = JsonSerializer.Serialize(new
            {
                Name = task.Title,
                DueDate = task.DueDate,
                IsDone = task.IsDone
            })
        });

        // Public feed cares only about completion, not generic edits.
        if (!wasDone && dto.IsDone)
            await _userEvents.RecordAsync(userId, UserEventType.TaskCompleted);

        return task;
    }

    public async Task<TaskItem?> CompleteTaskAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return null;

        task.IsDone = true;
        task.CompletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _activityService.CreateAsync(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.TaskCompleted,
            CustomerId = task.CustomerId,
            CreatedAt = DateTime.UtcNow,
            PayloadJson = JsonSerializer.Serialize(new
            {
                Name = task.Title,
                DueDate = task.DueDate
            })
        });

        await _userEvents.RecordAsync(userId, UserEventType.TaskCompleted);

        return task;
    }

    public async Task<bool> DeleteTaskAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<TaskListItemDto>> GetCompletedTasksAsync(Guid userId)
    {
        return await _db.Tasks
            .Where(t => t.IsDone && t.Customer.OwnerId == userId)
            .OrderByDescending(t => t.CompletedAt)
            .Select(t => new TaskListItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsDone = t.IsDone,
                CompletedAt = t.CompletedAt,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer.Name
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskListItemDto>> GetDueTasksAsync(Guid userId)
    {
        return await _db.Tasks
            .Where(t => !t.IsDone && t.DueDate != null && t.Customer.OwnerId == userId)
            .OrderBy(t => t.DueDate)
            .Select(t => new TaskListItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsDone = t.IsDone,
                CompletedAt = t.CompletedAt,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer.Name
            })
            .ToListAsync();
    }
}
