using System.Net.Http.Headers;
using System.Net.Http.Json;
using Backend.Options;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public class ResendEmailSender : IEmailSender
{
    private readonly HttpClient _http;
    private readonly EmailOptions _options;

    public ResendEmailSender(HttpClient http, IOptions<EmailOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.FromAddress))
            throw new InvalidOperationException("Email__FromAddress is not configured.");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ResendApiKey);
        request.Content = JsonContent.Create(new
        {
            from = $"{_options.FromName} <{_options.FromAddress}>",
            to = new[] { toEmail },
            subject,
            html = htmlBody
        });

        using var response = await _http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            // Resend returns descriptive JSON errors — surface them verbatim
            var body = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException($"Resend API returned {(int)response.StatusCode}: {body}");
        }
    }
}
