using Backend.Services.Reminders;

namespace Backend.Tests;

public class ReminderEmailComposerTests
{
    private static readonly DateOnly Today = new(2026, 6, 10);

    [Fact]
    public void OnlyUpcoming_SubjectCountsThem()
    {
        var (subject, _) = ReminderEmailComposer.Compose("Boz", Today,
        [
            new ReminderTaskLine("Call client", "Acme", Today),
            new ReminderTaskLine("Send offer", "Acme", Today.AddDays(2)),
        ]);
        Assert.Equal("2 tasks due soon", subject);
    }

    [Fact]
    public void OnlyOverdue_SubjectCountsThem()
    {
        var (subject, _) = ReminderEmailComposer.Compose("Boz", Today,
        [
            new ReminderTaskLine("Follow up", "Acme", Today.AddDays(-1)),
        ]);
        Assert.Equal("1 overdue task", subject);
    }

    [Fact]
    public void Mixed_SubjectMentionsBoth()
    {
        var (subject, _) = ReminderEmailComposer.Compose("Boz", Today,
        [
            new ReminderTaskLine("Follow up", "Acme", Today.AddDays(-3)),
            new ReminderTaskLine("Call client", "Beta", Today.AddDays(1)),
        ]);
        Assert.Equal("1 task due soon, 1 overdue", subject);
    }

    [Fact]
    public void OverdueAndUpcoming_RenderInSeparateSections()
    {
        var (_, html) = ReminderEmailComposer.Compose("Boz", Today,
        [
            new ReminderTaskLine("Old task", "Acme", Today.AddDays(-2)),
            new ReminderTaskLine("New task", "Beta", Today.AddDays(1)),
        ]);
        Assert.Contains("Overdue", html);
        Assert.Contains("Due soon", html);
        Assert.Contains("2 days overdue", html);
        Assert.Contains("due tomorrow", html);
    }

    [Fact]
    public void DueLabels_TodayAndFuture()
    {
        var (_, html) = ReminderEmailComposer.Compose("Boz", Today,
        [
            new ReminderTaskLine("A", "C", Today),
            new ReminderTaskLine("B", "C", Today.AddDays(3)),
        ]);
        Assert.Contains("due today", html);
        Assert.Contains("due in 3 days", html);
    }

    [Fact]
    public void DateFormatting_IsCultureInvariant()
    {
        var original = System.Globalization.CultureInfo.CurrentCulture;
        try
        {
            System.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo("bg-BG");
            var (_, html) = ReminderEmailComposer.Compose("Boz", Today,
            [
                new ReminderTaskLine("A", "C", Today),
            ]);
            Assert.Contains("June 10, 2026", html);
        }
        finally
        {
            System.Globalization.CultureInfo.CurrentCulture = original;
        }
    }

    [Fact]
    public void HtmlInUserContent_IsEncoded()
    {
        var (_, html) = ReminderEmailComposer.Compose("<b>Boz</b>", Today,
        [
            new ReminderTaskLine("<script>alert(1)</script>", "A & B <Ltd>", Today),
        ]);
        Assert.DoesNotContain("<script>", html);
        Assert.DoesNotContain("<b>Boz</b>", html);
        Assert.Contains("&lt;script&gt;", html);
        Assert.Contains("A &amp; B", html);
    }
}
