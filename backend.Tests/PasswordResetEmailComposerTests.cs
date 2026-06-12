using Backend.Services;

namespace Backend.Tests;

public class PasswordResetEmailComposerTests
{
    [Fact]
    public void Compose_IncludesResetUrlAndName()
    {
        var (subject, html) = PasswordResetEmailComposer.Compose(
            "Boz", "http://localhost:5173/reset-password?email=a%40b.c&token=abc123");

        Assert.Equal("Reset your CRM Mini password", subject);
        Assert.Contains("Hi Boz", html);
        Assert.Contains("http://localhost:5173/reset-password?email=a%40b.c&amp;token=abc123", html);
    }

    [Fact]
    public void Compose_HtmlEncodesUserName()
    {
        var (_, html) = PasswordResetEmailComposer.Compose("<script>", "https://x.test/reset");

        Assert.DoesNotContain("<script>", html);
        Assert.Contains("&lt;script&gt;", html);
    }
}
