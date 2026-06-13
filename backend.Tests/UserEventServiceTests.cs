using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class UserEventServiceTests : IDisposable
{
    private static readonly DateTimeOffset Start = new(2026, 6, 13, 12, 0, 0, TimeSpan.Zero);

    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly MutableTimeProvider _time = new() { Now = Start };
    private readonly UserEventService _service;

    private readonly Guid _publicUser = Guid.NewGuid();
    private readonly Guid _otherPublicUser = Guid.NewGuid();
    private readonly Guid _privateUser = Guid.NewGuid();

    private sealed class MutableTimeProvider : TimeProvider
    {
        public DateTimeOffset Now { get; set; }
        public override DateTimeOffset GetUtcNow() => Now;
    }

    public UserEventServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _db.Users.AddRange(
            new User { Id = _publicUser, Name = "Mona", UserName = "mona@test.local", Email = "mona@test.local" },
            new User { Id = _otherPublicUser, Name = "Vince", UserName = "vince@test.local", Email = "vince@test.local" },
            new User { Id = _privateUser, Name = "Shy", UserName = "shy@test.local", Email = "shy@test.local" });

        EnablePublic(_publicUser);
        EnablePublic(_otherPublicUser);
        // _privateUser deliberately has no settings row → not public.
        _db.SaveChanges();

        _service = new UserEventService(_db, _time);
    }

    private void EnablePublic(Guid userId)
    {
        _db.UserSettings.Add(new UserSettings
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PublicSpaceEnabled = true,
            CreatedAt = Start.UtcDateTime,
            UpdatedAt = Start.UtcDateTime
        });
    }

    [Fact]
    public async Task Record_NoOps_WhenUserNotPublic()
    {
        await _service.RecordAsync(_privateUser, UserEventType.TaskCreated);

        Assert.Empty(_db.UserEvents);
    }

    [Fact]
    public async Task Record_Persists_WhenUserPublic()
    {
        await _service.RecordAsync(_publicUser, UserEventType.FocusSessionCompleted, 25);

        var ev = Assert.Single(_db.UserEvents);
        Assert.Equal(UserEventType.FocusSessionCompleted, ev.Type);
        Assert.Equal(25, ev.DurationMinutes);
    }

    [Fact]
    public async Task NotebookWrite_CoalescesWithinWindow_AndAdvancesTimestamp()
    {
        await _service.RecordAsync(_publicUser, UserEventType.NotebookWrote);

        _time.Now = Start.AddMinutes(20);
        await _service.RecordAsync(_publicUser, UserEventType.NotebookWrote);

        var ev = Assert.Single(_db.UserEvents.Where(e => e.Type == UserEventType.NotebookWrote));
        Assert.Equal(Start.AddMinutes(20).UtcDateTime, ev.OccurredAt);
    }

    [Fact]
    public async Task NotebookWrite_StartsNewSession_AfterGap()
    {
        await _service.RecordAsync(_publicUser, UserEventType.NotebookWrote);

        _time.Now = Start.AddMinutes(45);
        await _service.RecordAsync(_publicUser, UserEventType.NotebookWrote);

        Assert.Equal(2, await _db.UserEvents.CountAsync(e => e.Type == UserEventType.NotebookWrote));
    }

    [Fact]
    public async Task GetFeed_ReturnsNull_ForPrivateViewer()
    {
        await _service.RecordAsync(_publicUser, UserEventType.TaskCreated);

        var feed = await _service.GetFeedAsync(_privateUser);

        Assert.Null(feed);
    }

    [Fact]
    public async Task GetFeed_ExcludesEventsOfCurrentlyPrivateUsers()
    {
        await _service.RecordAsync(_publicUser, UserEventType.TaskCreated);

        // A leftover event from someone who has since turned the space off.
        _db.UserEvents.Add(new UserEvent
        {
            Id = Guid.NewGuid(),
            UserId = _privateUser,
            Type = UserEventType.TaskCompleted,
            OccurredAt = Start.UtcDateTime
        });
        await _db.SaveChangesAsync();

        var feed = await _service.GetFeedAsync(_publicUser);

        var entry = Assert.Single(feed!);
        Assert.Equal("Mona", entry.UserName);
    }

    [Fact]
    public async Task GetFeed_OrdersNewestFirst()
    {
        await _service.RecordAsync(_publicUser, UserEventType.TaskCreated);

        _time.Now = Start.AddMinutes(10);
        await _service.RecordAsync(_otherPublicUser, UserEventType.FocusSessionCompleted, 50);

        var feed = await _service.GetFeedAsync(_publicUser);

        Assert.NotNull(feed);
        Assert.Equal(2, feed!.Count);
        Assert.Equal(UserEventType.FocusSessionCompleted, feed[0].Type);
        Assert.Equal(50, feed[0].DurationMinutes);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }
}
