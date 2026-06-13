using Backend.Dtos;
using Backend.Models;

namespace Backend.Services;

public interface IUserEventService
{
    // Records a public-space event for the user. No-op when the user does not
    // currently have the public space enabled. NotebookWrote events are
    // coalesced into one event per writing session (see UserEventService).
    Task RecordAsync(Guid userId, UserEventType type, int? durationMinutes = null);

    // The reciprocal feed: newest-first events across all currently-public
    // users. Returns null when the viewer is not public themselves (they must
    // opt in to view).
    Task<IReadOnlyList<PublicEventDto>?> GetFeedAsync(Guid viewerUserId, int limit = 50);
}
