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
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        var customers = await _db.Customers
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Customer>> GetCustomerById(Guid id)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
            return NotFound("Customer not found");

        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(CreateCustomerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        if (string.IsNullOrWhiteSpace(dto.Country))
            return BadRequest("Country is required");

        // var customer = new Customer
        // {
        //     Id = Guid.NewGuid(),
        //     Name = dto.Name.Trim(),
        //     Email = dto.Email.Trim(),
        //     Country = dto.Country.Trim(),
        //     UserId = Guid.Empty // temporary until auth is implemented
        // };
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim(),
                Country = dto.Country.Trim(),
                Company = dto.Company?.Trim(),
                UserId = Guid.Parse("11111111-1111-1111-1111-111111111111")
            };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Customer>> UpdateCustomer(Guid id, UpdateCustomerDto dto)
    {
        var customer = await _db.Customers.FindAsync(id);

        if (customer == null)
            return NotFound("Customer not found");

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        if (string.IsNullOrWhiteSpace(dto.Country))
            return BadRequest("Country is required");

        customer.Name = dto.Name.Trim();
        customer.Email = dto.Email.Trim();
        customer.Country = dto.Country.Trim();
        customer.Company = dto.Company?.Trim();

        await _db.SaveChangesAsync();

        return Ok(customer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _db.Customers.FindAsync(id);

        if (customer == null)
            return NotFound("Customer not found");

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id:guid}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(Guid id)
    {
        var customerExists = await _db.Customers.AnyAsync(c => c.Id == id);

        if (!customerExists)
            return NotFound("Customer not found");

        var tasks = await _db.Tasks
            .Where(t => t.CustomerId == id)
            .OrderBy(t => t.IsDone)
            .ThenBy(t => t.DueDate)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost("{id:guid}/tasks")]
public async Task<ActionResult<TaskItem>> AddTask(Guid id, CreateTaskDto dto)
{
    try
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
            return NotFound($"Customer with id {id} was not found.");

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            DueDate = dto.DueDate,
            IsDone = false,
            CustomerId = id
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return Ok(new
        {
         task.Id,
         task.Title,
         task.DueDate,
         task.IsDone,
         task.CustomerId   
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            message = ex.Message,
            inner = ex.InnerException?.Message,
            stack = ex.StackTrace
        });
    }
}
}