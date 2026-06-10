using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IDataProtectionKeyContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<NoteItem> Notes => Set<NoteItem>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Owner)
            .WithMany(u => u.Customers)
            .HasForeignKey(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Customer)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .Property(t => t.DueDate)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<TaskItem>()
            .Property(t => t.CompletedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<Customer>()
            .Property(c => c.CreatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<UserSettings>()
            .HasOne(x => x.User)
            .WithOne()
            .HasForeignKey<UserSettings>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSettings>()
            .Property(s => s.CreatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<UserSettings>()
            .Property(s => s.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<NoteItem>()
            .HasOne(n => n.Customer)
            .WithMany(c => c.Notes)
            .HasForeignKey(n => n.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NoteItem>()
            .Property(n => n.CreatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<NoteItem>()
            .Property(n => n.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<Activity>()
            .Property(a => a.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Activity>()
            .HasOne(a => a.Customer)
            .WithMany(c => c.Activities)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}