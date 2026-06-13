using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class NotebookServiceTests : IDisposable
{
    private static readonly DateTimeOffset Now = new(2026, 6, 13, 12, 0, 0, TimeSpan.Zero);

    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly NotebookService _service;

    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _otherUserId = Guid.NewGuid();

    private sealed class FixedTimeProvider : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => Now;
    }

    public NotebookServiceTests()
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

        _service = new NotebookService(_db, new FixedTimeProvider());
    }

    [Fact]
    public async Task Create_PersistsTrimmedTitleAndTimestamps()
    {
        var page = await _service.CreateAsync(_userId, "  My page  ", "Hello");

        Assert.Equal("My page", page.Title);
        Assert.Equal("Hello", page.Content);
        Assert.Equal(Now.UtcDateTime, page.CreatedAt);
        Assert.Equal(Now.UtcDateTime, page.UpdatedAt);
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyOwnPages()
    {
        await _service.CreateAsync(_userId, "Mine", "a");
        await _service.CreateAsync(_otherUserId, "Theirs", "b");

        var pages = await _service.GetAllAsync(_userId);

        var only = Assert.Single(pages);
        Assert.Equal("Mine", only.Title);
    }

    [Fact]
    public async Task Update_ChangesContent_ForOwner()
    {
        var page = await _service.CreateAsync(_userId, "Title", "old");

        var updated = await _service.UpdateAsync(_userId, page.Id, "Title", "new");

        Assert.NotNull(updated);
        Assert.Equal("new", updated!.Content);
    }

    [Fact]
    public async Task Update_ReturnsNull_ForOtherUser()
    {
        var page = await _service.CreateAsync(_userId, "Title", "old");

        var updated = await _service.UpdateAsync(_otherUserId, page.Id, "Hacked", "x");

        Assert.Null(updated);
        // The original is untouched
        var reloaded = Assert.Single(await _service.GetAllAsync(_userId));
        Assert.Equal("old", reloaded.Content);
    }

    [Fact]
    public async Task Delete_RemovesOwnPage_ButNotOthers()
    {
        var page = await _service.CreateAsync(_userId, "Title", "x");

        Assert.False(await _service.DeleteAsync(_otherUserId, page.Id));
        Assert.True(await _service.DeleteAsync(_userId, page.Id));
        Assert.Empty(await _service.GetAllAsync(_userId));
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }
}
