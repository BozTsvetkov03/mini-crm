using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface INoteService
{
    Task<IEnumerable<NoteItem>> GetNotesByCustomerAsync(Guid customerId, Guid userId);
    Task<NoteItem?> GetNoteByIdAsync(Guid id, Guid userId);
    Task<NoteItem?> CreateNoteAsync(Guid customerId, CreateNoteDto dto, Guid userId);
    Task<NoteItem?> UpdateNoteAsync(Guid id, UpdateNoteDto dto, Guid userId);
    Task<bool> DeleteNoteAsync(Guid id, Guid userId);
}
