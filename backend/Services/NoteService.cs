using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services;

public class NoteService : INoteService
{
    private readonly AppDbContext _db;
    private readonly IActivityService _activityService;

    public NoteService(AppDbContext db, IActivityService activityService)
    {
        _db = db;
        _activityService = activityService;
    }

    public async Task<IEnumerable<NoteItem>> GetNotesByCustomerAsync(Guid customerId, Guid userId)
    {
        return await _db.Notes
            .Where(n => n.CustomerId == customerId && n.Customer.OwnerId == userId)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    public async Task<NoteItem?> GetNoteByIdAsync(Guid id, Guid userId)
    {
        return await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.Customer.OwnerId == userId);
    }

    public async Task<NoteItem?> CreateNoteAsync(Guid customerId, CreateNoteDto dto, Guid userId)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == customerId && c.OwnerId == userId);

        if (!customerExists)
            return null;

        var now = DateTime.UtcNow;

        var note = new NoteItem
        {
            Id = Guid.NewGuid(),
            Content = dto.Content.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
            CustomerId = customerId
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        await _activityService.CreateAsync(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.NoteCreated,
            CustomerId = customerId,
            CreatedAt = now,
            PayloadJson = JsonSerializer.Serialize(new
            {
                Body = note.Content
            })
        });

        return note;
    }

    public async Task<NoteItem?> UpdateNoteAsync(Guid id, UpdateNoteDto dto, Guid userId)
    {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.Customer.OwnerId == userId);

        if (note == null)
            return null;

        note.Content = dto.Content.Trim();
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _activityService.CreateAsync(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.NoteEdited,
            CustomerId = note.CustomerId,
            CreatedAt = note.UpdatedAt,
            PayloadJson = JsonSerializer.Serialize(new
            {
                Body = note.Content
            })
        });

        return note;
    }

    public async Task<bool> DeleteNoteAsync(Guid id, Guid userId)
    {
        var note = await _db.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.Customer.OwnerId == userId);

        if (note == null)
            return false;

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();

        // optional: you can also log deletion if you want history
        // await _activityService.CreateAsync(...)

        return true;
    }
}