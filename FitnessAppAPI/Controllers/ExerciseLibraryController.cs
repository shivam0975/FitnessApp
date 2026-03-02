using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExerciseLibraryController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public ExerciseLibraryController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record ExerciseResponse(Guid ExerciseId, string ExerciseName, string Category, string? MuscleGroup, decimal MetValue, string DifficultyLevel, string? Instructions, bool? IsActive, DateTime CreatedAt);

        public record CreateExerciseRequest(string ExerciseName, string Category, string? MuscleGroup, decimal MetValue, string? DifficultyLevel, string? Instructions, bool? IsActive);

        public record UpdateExerciseRequest(string? ExerciseName, string? Category, string? MuscleGroup, decimal? MetValue, string? DifficultyLevel, string? Instructions, bool? IsActive);

        // GET: api/exerciselibrary
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExerciseResponse>>> GetExercises()
        {
            var items = await _db.Exerciselibraries.AsNoTracking()
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new ExerciseResponse(e.ExerciseId, e.ExerciseName, e.Category, e.MuscleGroup, e.MetValue, e.DifficultyLevel, e.Instructions, e.IsActive, e.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/exerciselibrary/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExerciseResponse>> GetExercise(Guid id)
        {
            var e = await _db.Exerciselibraries.AsNoTracking().FirstOrDefaultAsync(x => x.ExerciseId == id);
            if (e == null) return NotFound();

            return Ok(new ExerciseResponse(e.ExerciseId, e.ExerciseName, e.Category, e.MuscleGroup, e.MetValue, e.DifficultyLevel, e.Instructions, e.IsActive, e.CreatedAt));
        }

        // POST: api/exerciselibrary
        [HttpPost]
        public async Task<ActionResult<ExerciseResponse>> CreateExercise([FromBody] CreateExerciseRequest req)
        {
            if (req == null) return BadRequest();
            if (string.IsNullOrWhiteSpace(req.ExerciseName) || string.IsNullOrWhiteSpace(req.Category)) return BadRequest("ExerciseName and Category are required.");

            if (await _db.Exerciselibraries.AnyAsync(x => x.ExerciseName == req.ExerciseName)) return Conflict("ExerciseName already exists.");

            var exercise = new Exerciselibrary
            {
                ExerciseId = Guid.NewGuid(),
                ExerciseName = req.ExerciseName,
                Category = req.Category,
                MuscleGroup = req.MuscleGroup,
                MetValue = req.MetValue,
                DifficultyLevel = string.IsNullOrWhiteSpace(req.DifficultyLevel) ? "Beginner" : req.DifficultyLevel,
                Instructions = req.Instructions,
                IsActive = req.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Exerciselibraries.Add(exercise);
            await _db.SaveChangesAsync();

            var res = new ExerciseResponse(exercise.ExerciseId, exercise.ExerciseName, exercise.Category, exercise.MuscleGroup, exercise.MetValue, exercise.DifficultyLevel, exercise.Instructions, exercise.IsActive, exercise.CreatedAt);

            return CreatedAtAction(nameof(GetExercise), new { id = exercise.ExerciseId }, res);
        }

        // PUT: api/exerciselibrary/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExercise(Guid id, [FromBody] UpdateExerciseRequest req)
        {
            var exercise = await _db.Exerciselibraries.FirstOrDefaultAsync(x => x.ExerciseId == id);
            if (exercise == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.ExerciseName) && req.ExerciseName != exercise.ExerciseName)
            {
                if (await _db.Exerciselibraries.AnyAsync(x => x.ExerciseName == req.ExerciseName && x.ExerciseId != id)) return Conflict("ExerciseName already exists.");
                exercise.ExerciseName = req.ExerciseName;
            }

            if (!string.IsNullOrWhiteSpace(req.Category)) exercise.Category = req.Category;
            if (req.MuscleGroup != null) exercise.MuscleGroup = req.MuscleGroup;
            if (req.MetValue.HasValue) exercise.MetValue = req.MetValue.Value;
            if (!string.IsNullOrWhiteSpace(req.DifficultyLevel)) exercise.DifficultyLevel = req.DifficultyLevel;
            if (req.Instructions != null) exercise.Instructions = req.Instructions;
            if (req.IsActive.HasValue) exercise.IsActive = req.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/exerciselibrary/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(Guid id)
        {
            var exercise = await _db.Exerciselibraries.FirstOrDefaultAsync(x => x.ExerciseId == id);
            if (exercise == null) return NotFound();

            _db.Exerciselibraries.Remove(exercise);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
