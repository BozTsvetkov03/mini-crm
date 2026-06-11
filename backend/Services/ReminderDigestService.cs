using Backend.Data;
using Backend.Options;
using Backend.Services.Interfaces;
using Backend.Services.Reminders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Backend.Services;

public class ReminderDigestService : IReminderDigestService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _email;
    private readonly TimeProvider _clock;
    private readonly ILogger<ReminderDigestService> _logger;
    private readonly string _appBaseUrl;

    public ReminderDigestService(
        AppDbContext db,
        IEmailSender email,
        TimeProvider clock,
        ILogger<ReminderDigestService> logger,
        IOptions<EmailOptions> emailOptions)
    {
        _db = db;
        _email = email;
        _clock = clock;
        _logger = logger;
        _appBaseUrl = emailOptions.Value.AppBaseUrl;
    }

    public async Task<DigestRunResult> RunAsync(bool force = false, CancellationToken ct = default)
    {
        var utcNow = _clock.GetUtcNow().UtcDateTime;
        var sent = 0;
        var tasksIncluded = 0;
        var errors = new List<string>();
        var skipped = new List<string>();

        var candidates = await _db.UserSettings
            .Where(s => s.EmailRemindersEnabled)
            .Join(_db.Users,
                s => s.UserId,
                u => u.Id,
                (s, u) => new { Settings = s, u.Id, u.Email, u.Name })
            .ToListAsync(ct);

        foreach (var user in candidates)
        {
            ct.ThrowIfCancellationRequested();

            if (string.IsNullOrWhiteSpace(user.Email))
                continue;

            // Registration validates strictly now, but accounts created before that
            // fix may still hold unsendable addresses — skip instead of crashing
            if (!MailboxAddress.TryParse(user.Email, out _))
            {
                _logger.LogWarning(
                    "Skipping reminder digest for user {UserId}: stored email is not a valid address", user.Id);
                errors.Add($"user {user.Id}: account email is not a valid address");
                continue;
            }

            DateOnly localToday;
            if (DigestTiming.DueLocalDate(
                    user.Settings.TimeZone, user.Settings.DigestHour, utcNow) is DateOnly due)
            {
                localToday = due;
            }
            else if (force)
            {
                var tz = DigestTiming.ResolveTimeZone(user.Settings.TimeZone);
                localToday = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz));
            }
            else
            {
                skipped.Add($"user {user.Id}: digest hour ({user.Settings.DigestHour}:00 {user.Settings.TimeZone}) not reached yet");
                continue;
            }

            // Single row per (UserId, DigestDate) — unique index; force updates it
            var existingLog = await _db.ReminderLogs
                .FirstOrDefaultAsync(r => r.UserId == user.Id && r.DigestDate == localToday, ct);
            if (existingLog is not null && !force)
            {
                skipped.Add($"user {user.Id}: digest for {localToday:yyyy-MM-dd} already sent at {existingLog.SentAt:u}");
                continue;
            }

            // DueDate is user wall-clock ("timestamp without time zone"); compare
            // against end of the last day inside the reminder window, kept Unspecified
            var windowEnd = localToday
                .AddDays(user.Settings.RemindDaysBefore)
                .ToDateTime(TimeOnly.MaxValue, DateTimeKind.Unspecified);

            var tasks = await _db.Tasks
                .Where(t => t.Customer.OwnerId == user.Id
                    && !t.IsDone
                    && t.DueDate != null
                    && t.DueDate <= windowEnd)
                .OrderBy(t => t.DueDate)
                .Select(t => new ReminderTaskLine(
                    t.Title,
                    t.Customer.Name,
                    DateOnly.FromDateTime(t.DueDate!.Value)))
                .ToListAsync(ct);

            if (tasks.Count == 0)
            {
                skipped.Add($"user {user.Id}: no open tasks due on or before {DateOnly.FromDateTime(windowEnd):yyyy-MM-dd}");
                continue;
            }

            try
            {
                var (subject, html) = ReminderEmailComposer.Compose(user.Name, localToday, tasks, _appBaseUrl);
                await _email.SendAsync(user.Email, subject, html, ct);

                if (existingLog is not null)
                {
                    existingLog.SentAt = utcNow;
                    existingLog.TaskCount = tasks.Count;
                }
                else
                {
                    _db.ReminderLogs.Add(new Models.ReminderLog
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        DigestDate = localToday,
                        SentAt = utcNow,
                        TaskCount = tasks.Count
                    });
                }
                await _db.SaveChangesAsync(ct);

                sent++;
                tasksIncluded += tasks.Count;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Failed to send reminder digest to user {UserId}", user.Id);
                errors.Add($"user {user.Id}: {ex.GetType().Name}: {ex.Message}");
            }
        }

        _logger.LogInformation(
            "Reminder digest run: {Checked} candidates, {Sent} digests sent, {Tasks} tasks included",
            candidates.Count, sent, tasksIncluded);

        return new DigestRunResult(candidates.Count, sent, tasksIncluded, errors, skipped);
    }
}
