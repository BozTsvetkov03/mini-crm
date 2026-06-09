using Backend.Dtos;

namespace Backend.Services.Interfaces;

public interface IUserSettingsService
{
    Task<UserSettingsDto> GetSettingsAsync(Guid userId);
    Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsDto dto);
}
