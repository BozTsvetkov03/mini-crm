using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UserEventService : IUserEventService
{
    // Continuous notebook writing collapses into a single event; a gap longer
    // than this starts a new "writing session". Keeps debounced autosaves from
    // spamming the feed.
    private static readonly TimeSpan NotebookCoalesceWindow = TimeSpan.FromMinutes(30);

    private readonly AppDbContext _db;
    private readonly TimeProvider _time;

    public UserEventService(AppDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task RecordAsync(Guid userId, UserEventType type, int? durationMinutes = null)
    {
        // Only record while the user is currently public — respects the
        // off-by-default contract and avoids tracking users who never opted in.
        var isPublic = await _db.UserSettings
            .AnyAsync(s => s.UserId == userId && s.PublicSpaceEnabled);

        if (!isPublic)
            return;

        var now = _time.GetUtcNow().UtcDateTime;

        if (type == UserEventType.NotebookWrote)
        {
            var recent = await _db.UserEvents
                .Where(e => e.UserId == userId && e.Type == UserEventType.NotebookWrote)
                .OrderByDescending(e => e.OccurredAt)
                .FirstOrDefaultAsync();

            // Within the window: extend the existing session rather than adding
            // a row, so the feed shows one "wrote in their notebook" entry that
            // floats to the top as they keep typing.
            if (recent != null && now - recent.OccurredAt <= NotebookCoalesceWindow)
            {
                recent.OccurredAt = now;
                await _db.SaveChangesAsync();
                return;
            }
        }

        _db.UserEvents.Add(new UserEvent
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            OccurredAt = now,
            DurationMinutes = durationMinutes
        });

        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<PublicEventDto>?> GetFeedAsync(Guid viewerUserId, int limit = 50)
    {
        // Reciprocal: you must be public yourself to see the feed.
        var viewerIsPublic = await _db.UserSettings
            .AnyAsync(s => s.UserId == viewerUserId && s.PublicSpaceEnabled);

        if (!viewerIsPublic)
            return null;

        var rows = await (
            from e in _db.UserEvents
            join s in _db.UserSettings on e.UserId equals s.UserId
            join u in _db.Users on e.UserId equals u.Id
            where s.PublicSpaceEnabled
            orderby e.OccurredAt descending
            select new { u.Name, e.Type, e.OccurredAt, e.DurationMinutes })
            .Take(limit)
            .ToListAsync();

        return rows.Select(r => new PublicEventDto
        {
            UserName = string.IsNullOrWhiteSpace(r.Name) ? "Someone" : r.Name,
            Type = r.Type,
            OccurredAt = r.OccurredAt,
            DurationMinutes = r.DurationMinutes
        }).ToList();
    }
}
