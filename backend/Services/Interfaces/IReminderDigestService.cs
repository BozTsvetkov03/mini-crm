namespace Backend.Services.Interfaces;

public record DigestRunResult(int UsersChecked, int DigestsSent, int TasksIncluded, List<string> Errors);

public interface IReminderDigestService
{
    Task<DigestRunResult> RunAsync(CancellationToken ct = default);
}
