using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Backend.Models;
using Backend.Services.Interfaces;

namespace Backend.Controllers;

[ApiController]
[Route("api/notes")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly INoteService _noteService;

    public NotesController(INoteService noteService)
    {
        _noteService = noteService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteItem>> GetNoteById(Guid id)
    {
        var userId = GetUserId();
        var note = await _noteService.GetNoteByIdAsync(id, userId);

        if (note == null)
            return NotFound("Note not found");

        return Ok(note);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoteItem>> Update(Guid id, UpdateNoteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Content is required");

        var userId = GetUserId();
        var note = await _noteService.UpdateNoteAsync(id, dto, userId);

        if (note == null)
            return NotFound("Note not found");

        return Ok(note);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _noteService.DeleteNoteAsync(id, userId);

        if (!deleted)
            return NotFound("Note not found");

        return NoContent();
    }
}
