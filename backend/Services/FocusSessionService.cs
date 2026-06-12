using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class FocusSessionService : IFocusSessionService
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _time;

    public FocusSessionService(AppDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<FocusSessionDto> CreateAsync(Guid userId, int durationMinutes)
    {
        var session = new FocusSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CompletedAt = _time.GetUtcNow().UtcDateTime,
            DurationMinutes = durationMinutes
        };

        _db.FocusSessions.Add(session);
        await _db.SaveChangesAsync();

        return Map(session);
    }

    public async Task<IEnumerable<FocusSessionDto>> GetSinceAsync(Guid userId, DateTime fromUtc)
    {
        return await _db.FocusSessions
            .Where(f => f.UserId == userId && f.CompletedAt >= fromUtc)
            .OrderByDescending(f => f.CompletedAt)
            .Select(f => new FocusSessionDto
            {
                Id = f.Id,
                CompletedAt = f.CompletedAt,
                DurationMinutes = f.DurationMinutes
            })
            .ToListAsync();
    }

    private static FocusSessionDto Map(FocusSession s) => new()
    {
        Id = s.Id,
        CompletedAt = s.CompletedAt,
        DurationMinutes = s.DurationMinutes
    };
}
