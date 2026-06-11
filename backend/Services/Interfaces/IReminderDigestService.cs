namespace Backend.Services.Interfaces;

public record DigestRunResult(
    int UsersChecked, int DigestsSent, int TasksIncluded, List<string> Errors, List<string> Skipped);

public interface IReminderDigestService
{
    /// <param name="force">
    /// Bypasses the digest-hour and once-per-day gates so a manual trigger
    /// always sends when there are matching tasks. Scheduled runs pass false.
    /// </param>
    Task<DigestRunResult> RunAsync(bool force = false, CancellationToken ct = default);
}
