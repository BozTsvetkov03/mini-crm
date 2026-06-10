using Backend.Services;

namespace Backend.Tests;

public class EmailValidatorTests
{
    [Theory]
    [InlineData("user@gmail.com")]
    [InlineData("first.last@example.co")]
    [InlineData("user+tag@example.org")]
    [InlineData("user_name-1@sub.example.com")]
    [InlineData("USER@EXAMPLE.COM")]
    public void Accepts_NormalAddresses(string email)
    {
        Assert.True(EmailValidator.IsValid(email));
    }

    [Theory]
    [InlineData("user@gmail.com f")] // the production case: valid address + trailing text
    [InlineData("user@gmail.com other@example.com")]
    [InlineData("John Doe <user@gmail.com>")]
    [InlineData("user@gmail.com,other@example.com")]
    [InlineData(" user@gmail.com")]
    [InlineData("user@gmail.com ")]
    [InlineData("user @gmail.com")]
    [InlineData("user@")]
    [InlineData("@gmail.com")]
    [InlineData("user")]
    [InlineData("user@localhost")]
    [InlineData("user@gmail")]
    [InlineData("user@@gmail.com")]
    [InlineData("user@gmail..com")]
    [InlineData("")]
    [InlineData("   ")]
    public void Rejects_MalformedAddresses(string email)
    {
        Assert.False(EmailValidator.IsValid(email));
    }
}
