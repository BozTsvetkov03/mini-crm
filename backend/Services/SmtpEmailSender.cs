using Backend.Options;
using Backend.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Backend.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;

    public SmtpEmailSender(IOptions<EmailOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (!_options.IsConfigured)
            throw new InvalidOperationException(
                "Email is not configured. Set Email__Host and Email__FromAddress.");

        if (!MailboxAddress.TryParse(_options.FromAddress, out var from))
            throw new InvalidOperationException(
                $"Email__FromAddress ('{_options.FromAddress}') is not a valid email address.");
        from.Name = _options.FromName;

        var message = new MimeMessage();
        message.From.Add(from);
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        // Auto negotiates STARTTLS with real providers and plaintext with local Mailpit
        await client.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.Auto, ct);
        if (!string.IsNullOrEmpty(_options.Username))
            await client.AuthenticateAsync(_options.Username, _options.Password, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(quit: true, ct);
    }
}
