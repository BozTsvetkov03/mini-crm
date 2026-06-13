using System.Security.Claims;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/notebook")]
[Authorize]
public class NotebookController : ControllerBase
{
    private const int MaxTitleLength = 200;
    private const int MaxContentLength = 100_000;

    private readonly INotebookService _notebook;

    public NotebookController(INotebookService notebook)
    {
        _notebook = notebook;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotebookPageDto>>> GetPages()
    {
        var pages = await _notebook.GetAllAsync(GetUserId());
        return Ok(pages);
    }

    [HttpPost]
    public async Task<ActionResult<NotebookPageDto>> CreatePage(CreateNotebookPageDto dto)
    {
        if ((dto.Title?.Length ?? 0) > MaxTitleLength)
            return BadRequest($"Title must be {MaxTitleLength} characters or less");

        if ((dto.Content?.Length ?? 0) > MaxContentLength)
            return BadRequest("This page is too long");

        var page = await _notebook.CreateAsync(GetUserId(), dto.Title, dto.Content);
        return Ok(page);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NotebookPageDto>> UpdatePage(Guid id, UpdateNotebookPageDto dto)
    {
        if (dto.Title.Length > MaxTitleLength)
            return BadRequest($"Title must be {MaxTitleLength} characters or less");

        if (dto.Content.Length > MaxContentLength)
            return BadRequest("This page is too long");

        var page = await _notebook.UpdateAsync(GetUserId(), id, dto.Title, dto.Content);
        if (page == null)
            return NotFound("Page not found");

        return Ok(page);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePage(Guid id)
    {
        var deleted = await _notebook.DeleteAsync(GetUserId(), id);
        if (!deleted)
            return NotFound("Page not found");

        return NoContent();
    }
}
