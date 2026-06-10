using System.Globalization;
using System.Net;
using System.Text;

namespace Backend.Services.Reminders;

public record ReminderTaskLine(string Title, string CustomerName, DateOnly DueDate);

public static class ReminderEmailComposer
{
    public static (string Subject, string Html) Compose(
        string userName, DateOnly localToday, IReadOnlyList<ReminderTaskLine> tasks)
    {
        var overdue = tasks.Where(t => t.DueDate < localToday).OrderBy(t => t.DueDate).ToList();
        var upcoming = tasks.Where(t => t.DueDate >= localToday).OrderBy(t => t.DueDate).ToList();

        var subject = (overdue.Count, upcoming.Count) switch
        {
            (0, var u) => $"{u} task{Plural(u)} due soon",
            (var o, 0) => $"{o} overdue task{Plural(o)}",
            (var o, var u) => $"{u} task{Plural(u)} due soon, {o} overdue",
        };

        var sb = new StringBuilder();
        sb.Append("""
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
              <h2 style="color:#059669;margin-bottom:4px;">CRM Mini</h2>
            """);
        // Invariant culture: the template is English and the server's culture
        // must not leak localized month names into it
        sb.Append($"<p>Hi {Html(userName)}, here's your task digest for {localToday.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture)}.</p>");

        if (overdue.Count > 0)
        {
            sb.Append("""<h3 style="color:#dc2626;margin-bottom:6px;">Overdue</h3>""");
            AppendTaskTable(sb, overdue, localToday);
        }

        if (upcoming.Count > 0)
        {
            sb.Append("""<h3 style="color:#374151;margin-bottom:6px;">Due soon</h3>""");
            AppendTaskTable(sb, upcoming, localToday);
        }

        sb.Append("""
              <p style="color:#6b7280;font-size:12px;margin-top:24px;">
                You're receiving this because email reminders are enabled in your CRM Mini settings.
              </p>
            </div>
            """);

        return (subject, sb.ToString());
    }

    private static void AppendTaskTable(StringBuilder sb, List<ReminderTaskLine> tasks, DateOnly today)
    {
        sb.Append("""<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">""");
        foreach (var t in tasks)
        {
            sb.Append($"""
                <tr style="border-bottom:1px solid #e5e7eb;">
                  <td style="padding:8px 4px;">{Html(t.Title)}</td>
                  <td style="padding:8px 4px;color:#6b7280;">{Html(t.CustomerName)}</td>
                  <td style="padding:8px 4px;text-align:right;white-space:nowrap;">{DueLabel(t.DueDate, today)}</td>
                </tr>
                """);
        }
        sb.Append("</table>");
    }

    private static string DueLabel(DateOnly due, DateOnly today)
    {
        var days = due.DayNumber - today.DayNumber;
        return days switch
        {
            < 0 => $"{-days} day{Plural(-days)} overdue",
            0 => "due today",
            1 => "due tomorrow",
            _ => $"due in {days} days",
        };
    }

    private static string Plural(int n) => n == 1 ? "" : "s";

    private static string Html(string s) => WebUtility.HtmlEncode(s);
}
