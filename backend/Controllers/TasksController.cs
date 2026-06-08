using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("calendar")]
    public async Task<ActionResult<IEnumerable<CalendarTaskDto>>> GetCalendar(
        [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        if (to <= from)
            return BadRequest("'to' must be after 'from'");

        var userId = GetUserId();
        var tasks = await _taskService.GetTasksForCalendarAsync(userId, from, to);
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskItem>> GetTaskById(Guid id)
    {
        var userId = GetUserId();
        var task = await _taskService.GetTaskByIdAsync(id, userId);

        if (task == null)
            return NotFound("Task not found");

        return Ok(task);
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<ActionResult<TaskItem>> Complete(Guid id)
    {
        var userId = GetUserId();
        var task = await _taskService.CompleteTaskAsync(id, userId);

        if (task == null)
            return NotFound("Task not found");

        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _taskService.DeleteTaskAsync(id, userId);

        if (!deleted)
            return NotFound("Task not found");

        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskItem>> Update(Guid id, UpdateTaskDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        var userId = GetUserId();
        var task = await _taskService.UpdateTaskAsync(id, dto, userId);

        if (task == null)
            return NotFound("Task not found");

        return Ok(task);
    }
}