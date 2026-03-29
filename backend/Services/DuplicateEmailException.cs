namespace Backend.Services;

public class DuplicateEmailException : Exception
{
    public DuplicateEmailException()
        : base("A customer with this email already exists.") { }
}
