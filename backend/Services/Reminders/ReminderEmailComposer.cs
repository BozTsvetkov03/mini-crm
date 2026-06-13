using System.Globalization;
using System.Net;
using System.Text;

namespace Backend.Services.Reminders;

public record ReminderTaskLine(string Title, string CustomerName, DateOnly DueDate);

public static class ReminderEmailComposer
{
    public static (string Subject, string Html) Compose(
        string userName, DateOnly localToday, IReadOnlyList<ReminderTaskLine> tasks,
        string? appUrl = null)
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
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <meta name="color-scheme" content="light">
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
                <tr>
                  <td align="center" style="padding:32px 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
                      <tr>
                        <td style="padding:32px 32px 36px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                          <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#5e6b5f;">Atelier</h1>
            """);
        // Invariant culture: the template is English and the server's culture
        // must not leak localized month names into it
        sb.Append($"""<p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Hi {Html(userName)}, here's your task digest for <strong>{localToday.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture)}</strong>.</p>""");

        if (overdue.Count > 0)
        {
            sb.Append("""<h2 style="margin:0 0 8px;font-size:18px;line-height:1.4;color:#dc2626;">Overdue</h2>""");
            AppendTaskTable(sb, overdue, localToday);
        }

        if (upcoming.Count > 0)
        {
            sb.Append("""<h2 style="margin:0 0 8px;font-size:18px;line-height:1.4;color:#374151;">Due soon</h2>""");
            AppendTaskTable(sb, upcoming, localToday);
        }

        if (!string.IsNullOrWhiteSpace(appUrl))
        {
            sb.Append($"""
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 0;">
                  <tr>
                    <td style="border-radius:8px;background-color:#059669;">
                      <a href="{Html(appUrl.TrimEnd('/'))}/tasks/due" style="display:inline-block;padding:12px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">View your tasks</a>
                    </td>
                  </tr>
                </table>
                """);
        }

        sb.Append("""
                          <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.5;">
                            You're receiving this because email reminders are enabled in your Atelier settings.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """);

        return (subject, sb.ToString());
    }

    private static void AppendTaskTable(StringBuilder sb, List<ReminderTaskLine> tasks, DateOnly today)
    {
        sb.Append("""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">""");
        foreach (var t in tasks)
        {
            var labelColor = t.DueDate < today ? "#dc2626"
                : t.DueDate == today ? "#d97706"
                : "#6b7280";
            sb.Append($"""
                <tr>
                  <td style="padding:10px 8px 10px 0;border-bottom:1px solid #e5e7eb;font-size:16px;line-height:1.5;">{Html(t.Title)}</td>
                  <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;line-height:1.5;color:#6b7280;">{Html(t.CustomerName)}</td>
                  <td style="padding:10px 0 10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;line-height:1.5;color:{labelColor};text-align:right;white-space:nowrap;">{DueLabel(t.DueDate, today)}</td>
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
