using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _db.Customers.ToListAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Name is required");
        }

        var customer = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            Country = dto.Country
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return Ok(customer);
    }

    [HttpGet("{id}/tasks")]
    public async Task<IActionResult> GetTasks(int id)
    {
        var customerExists = await _db.Customers.AnyAsync(c => c.Id == id);
            if (!customerExists) 
                return NotFound();
            
            var tasks = await _db.Tasks
                .Where(t => t.CustomerId == id)
                .OrderBy(t => t.IsDone)
                .ThenBy(t => t.DueDate)
                .ToListAsync();

            return Ok(tasks);
    }

    [HttpPost("{id}/tasks")]
    public async Task<IActionResult> AddTask(int id, CreateTaskDto dto)
    {
        var customerExists = await _db.Customers.AnyAsync(c => c.Id == id); 
        if (!customerExists)
            return NotFound("Customer not found");

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        var task = new TaskItem
        {
            Title = dto.Title,
            DueDate = dto.DueDate,
            IsDone = false,
            CustomerId = id
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
            return NotFound();

        // Also delete tasks when deleting customer, might improve it later
        var customerTasks = await _db.Tasks
            .Where(t => t.CustomerId == id)
            .ToListAsync();

        if (customerTasks.Any())
        {
            _db.Tasks.RemoveRange(customerTasks);
        }

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();

        return NoContent();
}
}