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
    public DbSet<ReminderLog> ReminderLogs => Set<ReminderLog>();
    public DbSet<FocusSession> FocusSessions => Set<FocusSession>();
    public DbSet<NotebookPage> NotebookPages => Set<NotebookPage>();
    public DbSet<UserEvent> UserEvents => Set<UserEvent>();
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

        modelBuilder.Entity<ReminderLog>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // DB-level idempotency backstop: at most one digest per user per local day
        modelBuilder.Entity<ReminderLog>()
            .HasIndex(r => new { r.UserId, r.DigestDate })
            .IsUnique();

        modelBuilder.Entity<ReminderLog>()
            .Property(r => r.SentAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<FocusSession>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FocusSession>()
            .Property(f => f.CompletedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<FocusSession>()
            .HasIndex(f => new { f.UserId, f.CompletedAt });

        modelBuilder.Entity<NotebookPage>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotebookPage>()
            .Property(p => p.CreatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<NotebookPage>()
            .Property(p => p.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<NotebookPage>()
            .HasIndex(p => new { p.UserId, p.CreatedAt });

        modelBuilder.Entity<UserEvent>()
            .HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserEvent>()
            .Property(e => e.Type)
            .HasConversion<string>();

        modelBuilder.Entity<UserEvent>()
            .Property(e => e.OccurredAt)
            .HasColumnType("timestamp with time zone");

        // Coalescing looks up a user's most recent event of a given type;
        // the feed sorts everything by OccurredAt.
        modelBuilder.Entity<UserEvent>()
            .HasIndex(e => new { e.UserId, e.Type, e.OccurredAt });

        modelBuilder.Entity<UserEvent>()
            .HasIndex(e => e.OccurredAt);

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