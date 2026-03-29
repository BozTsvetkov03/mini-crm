using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Backend.Services.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ITaskService _taskService;

    public CustomersController(ICustomerService customerService, ITaskService taskService)
    {
        _customerService = customerService;
        _taskService = taskService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        var userId = GetUserId();
        var customers = await _customerService.GetCustomersAsync(userId);
        return Ok(customers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Customer>> GetCustomerById(Guid id)
    {
        var userId = GetUserId();
        var customer = await _customerService.GetCustomerByIdAsync(id, userId);

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

        if (!IsValidEmail(dto.Email.Trim()))
            return BadRequest("Invalid email format");

        if (string.IsNullOrWhiteSpace(dto.Country))
            return BadRequest("Country is required");

        var userId = GetUserId();

        try
        {
            var customer = await _customerService.CreateCustomerAsync(dto, userId);
            return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
        }
        catch (DuplicateEmailException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Customer>> UpdateCustomer(Guid id, UpdateCustomerDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        if (!IsValidEmail(dto.Email.Trim()))
            return BadRequest("Invalid email format");

        if (string.IsNullOrWhiteSpace(dto.Country))
            return BadRequest("Country is required");

        var userId = GetUserId();

        try
        {
            var customer = await _customerService.UpdateCustomerAsync(id, dto, userId);

            if (customer == null)
                return NotFound("Customer not found");

            return Ok(customer);
        }
        catch (DuplicateEmailException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _customerService.DeleteCustomerAsync(id, userId);

        if (!deleted)
            return NotFound("Customer not found");

        return NoContent();
    }

    [HttpGet("{id:guid}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(Guid id)
    {
        var userId = GetUserId();
        var customer = await _customerService.GetCustomerByIdAsync(id, userId);

        if (customer == null)
            return NotFound("Customer not found");

        var tasks = await _taskService.GetTasksByCustomerAsync(id, userId);
        return Ok(tasks);
    }

    [HttpPost("{id:guid}/tasks")]
    public async Task<ActionResult<TaskItem>> AddTask(Guid id, CreateTaskDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        var userId = GetUserId();
        var task = await _taskService.CreateTaskAsync(id, dto, userId);

        if (task == null)
            return NotFound("Customer not found");

        return Ok(task);
    }

    private static bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$");
    }
}