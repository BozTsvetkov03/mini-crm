using Backend.Dtos;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<Customer>> GetCustomersAsync(Guid userId);
    Task<Customer?> GetCustomerByIdAsync(Guid id, Guid userId);
    Task<Customer> CreateCustomerAsync(CreateCustomerDto dto, Guid userId);
    Task<Customer?> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto, Guid userId);
    Task<bool> DeleteCustomerAsync(Guid id, Guid userId);
}