namespace Backend.Dtos;

public class UpdateCustomerDto
{
    public string Name { get; set; } = "";
    public string? Email { get; set; } = "";
    public string? Country { get; set; } = "";
}