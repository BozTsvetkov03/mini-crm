using System.Text.RegularExpressions;
using MimeKit;

namespace Backend.Services;

public static class EmailValidator
{
    // Strict RFC parsing rejects inputs like "user@gmail.com f" (valid address
    // plus trailing text) that MailboxAddress.Parse later refuses when sending
    private static readonly ParserOptions StrictParser = new()
    {
        AddressParserComplianceMode = RfcComplianceMode.Strict,
        AllowAddressesWithoutDomain = false
    };

    public static bool IsValid(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        if (!MailboxAddress.TryParse(StrictParser, email, out var mailbox))
            return false;

        // The parsed address must round-trip to the exact input; this rejects
        // display names, comments, and anything the parser silently dropped
        if (!string.Equals(mailbox.Address, email, StringComparison.Ordinal))
            return false;

        // Require a dotted domain ending in a 2+ char label, so RFC-valid but
        // unroutable addresses like "user@localhost" stay rejected
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$");
    }
}
