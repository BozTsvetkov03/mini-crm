namespace Backend.Dtos;

public class UpdateCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? Country { get; set; } = string.Empty;
}