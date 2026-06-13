using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class NotebookService : INotebookService
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _time;
    private readonly IUserEventService _userEvents;

    public NotebookService(AppDbContext db, TimeProvider time, IUserEventService userEvents)
    {
        _db = db;
        _time = time;
        _userEvents = userEvents;
    }

    // Stable, notebook-like order: pages stay where they were created rather
    // than jumping around as they're edited
    public async Task<IEnumerable<NotebookPageDto>> GetAllAsync(Guid userId)
    {
        return await _db.NotebookPages
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new NotebookPageDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<NotebookPageDto> CreateAsync(Guid userId, string? title, string? content)
    {
        var now = _time.GetUtcNow().UtcDateTime;
        var page = new NotebookPage
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = (title ?? string.Empty).Trim(),
            Content = content ?? string.Empty,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.NotebookPages.Add(page);
        await _db.SaveChangesAsync();

        await _userEvents.RecordAsync(userId, UserEventType.NotebookPageCreated);

        return Map(page);
    }

    public async Task<NotebookPageDto?> UpdateAsync(Guid userId, Guid id, string title, string content)
    {
        var page = await _db.NotebookPages
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (page == null)
            return null;

        page.Title = title.Trim();
        page.Content = content;
        page.UpdatedAt = _time.GetUtcNow().UtcDateTime;

        await _db.SaveChangesAsync();

        // Coalesced inside the service: many debounced autosaves become one
        // "wrote in their notebook" event per sitting.
        await _userEvents.RecordAsync(userId, UserEventType.NotebookWrote);

        return Map(page);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var page = await _db.NotebookPages
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (page == null)
            return false;

        _db.NotebookPages.Remove(page);
        await _db.SaveChangesAsync();
        return true;
    }

    private static NotebookPageDto Map(NotebookPage p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Content = p.Content,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
