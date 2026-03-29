using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByCustomerAsync(Guid customerId, Guid userId)
    {
        return await _db.Tasks
            .Where(t => t.CustomerId == customerId && t.Customer.OwnerId == userId)
            .OrderBy(t => t.IsDone)
            .ThenBy(t => t.DueDate)
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

        return task;
    }

    public async Task<TaskItem?> UpdateTaskAsync(Guid id, UpdateTaskDto dto, Guid userId)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return null;

        task.Title = dto.Title.Trim();
        task.DueDate = dto.DueDate;
        task.IsDone = dto.IsDone;

        await _db.SaveChangesAsync();

        return task;
    }

    public async Task<TaskItem?> CompleteTaskAsync(Guid id, Guid userId)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return null;

        task.IsDone = true;
        await _db.SaveChangesAsync();

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
}
