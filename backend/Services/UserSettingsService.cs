using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UserSettingsService : IUserSettingsService
{
    private readonly AppDbContext _db;

    public UserSettingsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserSettingsDto> GetSettingsAsync(Guid userId)
    {
        var settings = await GetOrCreateAsync(userId);
        return ToDto(settings);
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsDto dto)
    {
        if (dto.TimeZone != null && !TimeZoneInfo.TryFindSystemTimeZoneById(dto.TimeZone, out _))
            throw new ArgumentException($"Unknown time zone '{dto.TimeZone}'.");

        var settings = await GetOrCreateAsync(userId);

        if (dto.Theme != null) settings.Theme = dto.Theme;
        if (dto.EmailRemindersEnabled.HasValue) settings.EmailRemindersEnabled = dto.EmailRemindersEnabled.Value;
        if (dto.RemindDaysBefore.HasValue) settings.RemindDaysBefore = dto.RemindDaysBefore.Value;
        if (dto.DigestHour.HasValue) settings.DigestHour = dto.DigestHour.Value;
        if (dto.TimeZone != null) settings.TimeZone = dto.TimeZone;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ToDto(settings);
    }

    private async Task<UserSettings> GetOrCreateAsync(Guid userId)
    {
        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            var now = DateTime.UtcNow;
            settings = new UserSettings
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync();
        }

        return settings;
    }

    private static UserSettingsDto ToDto(UserSettings settings) => new()
    {
        Theme = settings.Theme,
        EmailRemindersEnabled = settings.EmailRemindersEnabled,
        RemindDaysBefore = settings.RemindDaysBefore,
        DigestHour = settings.DigestHour,
        TimeZone = settings.TimeZone
    };
}
