using System.Net;
using System.Text.Json;
using Backend.Options;
using Backend.Services;
using MsOptions = Microsoft.Extensions.Options.Options;

namespace Backend.Tests;

public class ResendEmailSenderTests
{
    private sealed class StubHandler : HttpMessageHandler
    {
        public HttpRequestMessage? Request;
        public string? RequestBody;
        public HttpResponseMessage Response = new(HttpStatusCode.OK)
        {
            Content = new StringContent("""{"id":"test"}""")
        };

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken ct)
        {
            Request = request;
            RequestBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(ct);
            return Response;
        }
    }

    private static (ResendEmailSender Sender, StubHandler Handler) Create()
    {
        var handler = new StubHandler();
        var options = MsOptions.Create(new EmailOptions
        {
            FromAddress = "noreply@atelier.dev",
            FromName = "Atelier",
            ResendApiKey = "re_test_key"
        });
        return (new ResendEmailSender(new HttpClient(handler), options), handler);
    }

    [Fact]
    public async Task SendsBearerAuthAndCorrectPayload()
    {
        var (sender, handler) = Create();

        await sender.SendAsync("user@example.com", "Hello", "<p>Hi</p>");

        Assert.NotNull(handler.Request);
        Assert.Equal("https://api.resend.com/emails", handler.Request!.RequestUri!.ToString());
        Assert.Equal("Bearer", handler.Request.Headers.Authorization!.Scheme);
        Assert.Equal("re_test_key", handler.Request.Headers.Authorization.Parameter);

        using var json = JsonDocument.Parse(handler.RequestBody!);
        var root = json.RootElement;
        Assert.Equal("Atelier <noreply@atelier.dev>", root.GetProperty("from").GetString());
        Assert.Equal("user@example.com", root.GetProperty("to")[0].GetString());
        Assert.Equal("Hello", root.GetProperty("subject").GetString());
        Assert.Equal("<p>Hi</p>", root.GetProperty("html").GetString());
    }

    [Fact]
    public async Task ApiError_SurfacesStatusAndBody()
    {
        var (sender, handler) = Create();
        handler.Response = new HttpResponseMessage(HttpStatusCode.Forbidden)
        {
            Content = new StringContent("""{"message":"sandbox restriction"}""")
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => sender.SendAsync("user@example.com", "Hello", "<p>Hi</p>"));

        Assert.Contains("403", ex.Message);
        Assert.Contains("sandbox restriction", ex.Message);
    }

    [Fact]
    public async Task MissingFromAddress_ThrowsClearError()
    {
        var handler = new StubHandler();
        var sender = new ResendEmailSender(
            new HttpClient(handler),
            MsOptions.Create(new EmailOptions { ResendApiKey = "re_test_key" }));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => sender.SendAsync("user@example.com", "Hello", "<p>Hi</p>"));

        Assert.Contains("Email__FromAddress", ex.Message);
    }
}
