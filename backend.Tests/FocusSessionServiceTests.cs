using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class FocusSessionServiceTests : IDisposable
{
    private static readonly DateTimeOffset Now = new(2026, 6, 13, 12, 0, 0, TimeSpan.Zero);

    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly FocusSessionService _service;

    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _otherUserId = Guid.NewGuid();

    private sealed class FixedTimeProvider : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => Now;
    }

    public FocusSessionServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _db.Users.AddRange(
            new User { Id = _userId, Name = "Me", UserName = "me@test.local", Email = "me@test.local" },
            new User { Id = _otherUserId, Name = "Other", UserName = "other@test.local", Email = "other@test.local" });
        _db.SaveChanges();

        _service = new FocusSessionService(_db, new FixedTimeProvider());
    }

    [Fact]
    public async Task Create_StampsCurrentUtcTime()
    {
        var dto = await _service.CreateAsync(_userId, 25);

        Assert.Equal(Now.UtcDateTime, dto.CompletedAt);
        Assert.Equal(25, dto.DurationMinutes);
        Assert.Single(_db.FocusSessions);
    }

    [Fact]
    public async Task GetSince_FiltersByDate()
    {
        _db.FocusSessions.AddRange(
            new FocusSession { Id = Guid.NewGuid(), UserId = _userId, CompletedAt = Now.UtcDateTime.AddDays(-10), DurationMinutes = 25 },
            new FocusSession { Id = Guid.NewGuid(), UserId = _userId, CompletedAt = Now.UtcDateTime.AddDays(-1), DurationMinutes = 50 });
        _db.SaveChanges();

        var result = await _service.GetSinceAsync(_userId, Now.UtcDateTime.AddDays(-7));

        var session = Assert.Single(result);
        Assert.Equal(50, session.DurationMinutes);
    }

    [Fact]
    public async Task GetSince_ExcludesOtherUsers()
    {
        _db.FocusSessions.Add(new FocusSession
        {
            Id = Guid.NewGuid(),
            UserId = _otherUserId,
            CompletedAt = Now.UtcDateTime,
            DurationMinutes = 25
        });
        _db.SaveChanges();

        var result = await _service.GetSinceAsync(_userId, Now.UtcDateTime.AddDays(-7));

        Assert.Empty(result);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }
}
