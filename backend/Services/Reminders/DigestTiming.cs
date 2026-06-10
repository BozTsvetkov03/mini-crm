namespace Backend.Services.Reminders;

public static class DigestTiming
{
    /// <summary>
    /// Returns the user's current local date if their digest hour has passed
    /// in their time zone, or null when the digest is not yet due today.
    /// </summary>
    public static DateOnly? DueLocalDate(string? timeZoneId, int digestHour, DateTime utcNow)
    {
        var tz = ResolveTimeZone(timeZoneId);
        var local = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcNow, DateTimeKind.Utc), tz);
        return local.Hour >= digestHour ? DateOnly.FromDateTime(local) : null;
    }

    public static TimeZoneInfo ResolveTimeZone(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return TimeZoneInfo.Utc;
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (Exception e) when (e is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }
}
