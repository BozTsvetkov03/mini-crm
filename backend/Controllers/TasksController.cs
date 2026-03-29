using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskItem>> GetTaskById(Guid id)
    {
        var userId = GetUserId();
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return NotFound("Task not found");

        return Ok(task);
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<ActionResult<TaskItem>> Complete(Guid id)
    {
        var userId = GetUserId();
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return NotFound("Task not found");

        task.IsDone = true;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            task.Id,
            task.Title,
            task.DueDate,
            task.IsDone,
            task.CustomerId
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return NotFound("Task not found");

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskItem>> Update(Guid id, UpdateTaskDto dto)
    {
        var userId = GetUserId();
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.Customer.OwnerId == userId);

        if (task == null)
            return NotFound("Task not found");

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        task.Title = dto.Title.Trim();
        task.DueDate = dto.DueDate;
        task.IsDone = dto.IsDone;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            task.Id,
            task.Title,
            task.DueDate,
            task.IsDone,
            task.CustomerId
        });
    }
}