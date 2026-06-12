using Backend.Data;
using Backend.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class ActivityServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly ActivityService _service;

    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly Guid _otherUserId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();

    public ActivityServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        Seed();
        _service = new ActivityService(_db);
    }

    private void Seed()
    {
        var owner = new User { Id = _ownerId, Name = "Owner", UserName = "owner@test.local", Email = "owner@test.local" };
        var other = new User { Id = _otherUserId, Name = "Other", UserName = "other@test.local", Email = "other@test.local" };
        _db.Users.AddRange(owner, other);

        _db.Customers.Add(new Customer
        {
            Id = _customerId,
            Name = "Acme",
            Email = "acme@test.local",
            Country = "BG",
            OwnerId = _ownerId,
            CreatedAt = DateTime.UtcNow
        });

        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            Type = ActivityType.NoteCreated,
            CustomerId = _customerId,
            CreatedAt = DateTime.UtcNow,
            PayloadJson = "{}"
        });

        _db.SaveChanges();
    }

    [Fact]
    public async Task GetByCustomer_ReturnsActivities_ForOwner()
    {
        var result = await _service.GetByCustomerAsync(_customerId, _ownerId);

        Assert.NotNull(result);
        Assert.Single(result);
    }

    [Fact]
    public async Task GetByCustomer_ReturnsNull_ForNonOwner()
    {
        var result = await _service.GetByCustomerAsync(_customerId, _otherUserId);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByCustomer_ReturnsNull_ForUnknownCustomer()
    {
        var result = await _service.GetByCustomerAsync(Guid.NewGuid(), _ownerId);

        Assert.Null(result);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }
}
