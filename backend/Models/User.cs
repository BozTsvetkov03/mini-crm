using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public class User : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public List<Customer> Customers { get; set; } = [];
}