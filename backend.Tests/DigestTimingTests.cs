using Backend.Services.Reminders;

namespace Backend.Tests;

public class DigestTimingTests
{
    [Fact]
    public void NotDue_BeforeDigestHour()
    {
        // 06:00 UTC, digest at 8, UTC user
        var result = DigestTiming.DueLocalDate("UTC", 8, new DateTime(2026, 6, 10, 6, 0, 0));
        Assert.Null(result);
    }

    [Fact]
    public void Due_AtExactDigestHour()
    {
        var result = DigestTiming.DueLocalDate("UTC", 8, new DateTime(2026, 6, 10, 8, 0, 0));
        Assert.Equal(new DateOnly(2026, 6, 10), result);
    }

    [Fact]
    public void Due_AfterDigestHour()
    {
        var result = DigestTiming.DueLocalDate("UTC", 8, new DateTime(2026, 6, 10, 21, 30, 0));
        Assert.Equal(new DateOnly(2026, 6, 10), result);
    }

    [Fact]
    public void TimeZoneShiftsLocalDateForward()
    {
        // 23:00 UTC June 10 = 02:00 June 11 in Sofia (UTC+3 in summer):
        // the digest is due for June 11, not June 10
        var result = DigestTiming.DueLocalDate("Europe/Sofia", 1, new DateTime(2026, 6, 10, 23, 0, 0));
        Assert.Equal(new DateOnly(2026, 6, 11), result);
    }

    [Fact]
    public void TimeZoneShiftsLocalDateBackward()
    {
        // 02:00 UTC June 10 = 22:00 June 9 in New York (UTC-4 in summer)
        var result = DigestTiming.DueLocalDate("America/New_York", 8, new DateTime(2026, 6, 10, 2, 0, 0));
        Assert.Equal(new DateOnly(2026, 6, 9), result);
    }

    [Fact]
    public void NotDue_WhenLocalMorningEarlierThanDigestHour()
    {
        // 04:00 UTC June 10 = 07:00 in Sofia, digest at 8 — not due yet
        var result = DigestTiming.DueLocalDate("Europe/Sofia", 8, new DateTime(2026, 6, 10, 4, 0, 0));
        Assert.Null(result);
    }

    [Fact]
    public void MidnightDigestHour_AlwaysDue()
    {
        var result = DigestTiming.DueLocalDate("UTC", 0, new DateTime(2026, 6, 10, 0, 0, 1));
        Assert.Equal(new DateOnly(2026, 6, 10), result);
    }

    [Fact]
    public void DstSpringForward_SkippedHourStillDelivers()
    {
        // US DST 2026: clocks jump 02:00 -> 03:00 on March 8 in New York.
        // 07:30 UTC = 03:30 EDT; a digest hour of 2 (inside the skipped hour)
        // must still be considered due that day.
        var result = DigestTiming.DueLocalDate("America/New_York", 2, new DateTime(2026, 3, 8, 7, 30, 0));
        Assert.Equal(new DateOnly(2026, 3, 8), result);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("Not/AZone")]
    public void InvalidTimeZone_FallsBackToUtc(string? tz)
    {
        var resolved = DigestTiming.ResolveTimeZone(tz);
        Assert.Equal(TimeZoneInfo.Utc, resolved);

        // and the due calculation behaves as UTC
        var result = DigestTiming.DueLocalDate(tz, 8, new DateTime(2026, 6, 10, 9, 0, 0));
        Assert.Equal(new DateOnly(2026, 6, 10), result);
    }

    [Fact]
    public void IanaTimeZone_Resolves()
    {
        var resolved = DigestTiming.ResolveTimeZone("Europe/Sofia");
        Assert.NotEqual(TimeZoneInfo.Utc, resolved);
    }
}
