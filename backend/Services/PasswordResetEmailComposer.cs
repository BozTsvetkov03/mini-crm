using System.Net;

namespace Backend.Services;

public static class PasswordResetEmailComposer
{
    public static (string Subject, string Html) Compose(string userName, string resetUrl)
    {
        var subject = "Reset your Atelier password";

        var html = $"""
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
                          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Hi {Html(userName)}, we received a request to reset your password. Click the button below to choose a new one.</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 0;">
                            <tr>
                              <td style="border-radius:8px;background-color:#059669;">
                                <a href="{Html(resetUrl)}" style="display:inline-block;padding:12px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">Reset password</a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">This link expires after a short while. If the button doesn't work, copy this address into your browser:</p>
                          <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#6b7280;word-break:break-all;">{Html(resetUrl)}</p>
                          <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.5;">
                            If you didn't request a password reset, you can safely ignore this email — your password won't change.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        return (subject, html);
    }

    private static string Html(string s) => WebUtility.HtmlEncode(s);
}
