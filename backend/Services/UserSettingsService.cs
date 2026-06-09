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
        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            var now = DateTime.UtcNow;
            settings = new UserSettings
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Theme = "light",
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync();
        }

        return new UserSettingsDto { Theme = settings.Theme };
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsDto dto)
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
                Theme = dto.Theme,
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.UserSettings.Add(settings);
        }
        else
        {
            settings.Theme = dto.Theme;
            settings.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return new UserSettingsDto { Theme = settings.Theme };
    }
}
