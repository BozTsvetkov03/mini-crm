using Backend.Dtos;

namespace Backend.Services;

public interface INotebookService
{
    Task<IEnumerable<NotebookPageDto>> GetAllAsync(Guid userId);
    Task<NotebookPageDto> CreateAsync(Guid userId, string? title, string? content);

    // Null when the page doesn't exist or isn't owned by userId
    Task<NotebookPageDto?> UpdateAsync(Guid userId, Guid id, string title, string content);
    Task<bool> DeleteAsync(Guid userId, Guid id);
}
