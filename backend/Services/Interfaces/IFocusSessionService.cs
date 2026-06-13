using Backend.Dtos;

namespace Backend.Services;

public interface IFocusSessionService
{
    Task<FocusSessionDto> CreateAsync(Guid userId, int durationMinutes);
    Task<IEnumerable<FocusSessionDto>> GetSinceAsync(Guid userId, DateTime fromUtc);
}
