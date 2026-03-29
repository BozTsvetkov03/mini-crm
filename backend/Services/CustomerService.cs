using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Customer>> GetCustomersAsync(Guid userId)
    {
        return await _db.Customers
            .Where(c => c.OwnerId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Customer?> GetCustomerByIdAsync(Guid id, Guid userId)
    {
        return await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == userId);
    }

    public async Task<Customer> CreateCustomerAsync(CreateCustomerDto dto, Guid userId)
    {
        var email = dto.Email.Trim();

        var emailExists = await _db.Customers
            .AnyAsync(c => c.Email == email && c.OwnerId == userId);

        if (emailExists)
            throw new DuplicateEmailException();

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = email,
            Country = dto.Country.Trim(),
            Company = dto.Company?.Trim(),
            OwnerId = userId
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return customer;
    }

    public async Task<Customer?> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto, Guid userId)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == userId);

        if (customer == null)
            return null;

        var email = dto.Email!.Trim();

        var emailExists = await _db.Customers
            .AnyAsync(c => c.Email == email
                && c.OwnerId == userId
                && c.Id != id);

        if (emailExists)
            throw new DuplicateEmailException();

        customer.Name = dto.Name.Trim();
        customer.Email = email;
        customer.Country = dto.Country!.Trim();
        customer.Company = dto.Company?.Trim();

        await _db.SaveChangesAsync();

        return customer;
    }

    public async Task<bool> DeleteCustomerAsync(Guid id, Guid userId)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.OwnerId == userId);

        if (customer == null)
            return false;

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();

        return true;
    }
}