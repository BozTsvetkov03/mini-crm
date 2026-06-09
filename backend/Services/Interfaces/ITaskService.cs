using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<TaskItem>> GetTasksByCustomerAsync(Guid customerId, Guid userId);
    Task<IEnumerable<CalendarTaskDto>> GetTasksForCalendarAsync(Guid userId, DateTime from, DateTime to);
    Task<TaskItem?> GetTaskByIdAsync(Guid id, Guid userId);
    Task<TaskItem?> CreateTaskAsync(Guid customerId, CreateTaskDto dto, Guid userId);
    Task<TaskItem?> UpdateTaskAsync(Guid id, UpdateTaskDto dto, Guid userId);
    Task<TaskItem?> CompleteTaskAsync(Guid id, Guid userId);
    Task<bool> DeleteTaskAsync(Guid id, Guid userId);
    Task<IEnumerable<TaskListItemDto>> GetCompletedTasksAsync(Guid userId);
    Task<IEnumerable<TaskListItemDto>> GetDueTasksAsync(Guid userId);
}
