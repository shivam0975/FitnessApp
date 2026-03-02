using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutExerciseController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public WorkoutExerciseController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record WorkoutExerciseResponse(Guid WorkoutExerciseId, Guid WorkoutLogId, Guid ExerciseId, int OrderIndex, int? Sets, int? Reps, decimal? WeightKg, int? DurationSeconds, decimal? DistanceKm, decimal? CaloriesBurned, string? Notes, DateTime CreatedAt);

        public record CreateWorkoutExerciseRequest(Guid WorkoutLogId, Guid ExerciseId, int OrderIndex, int? Sets, int? Reps, decimal? WeightKg, int? DurationSeconds, decimal? DistanceKm, decimal? CaloriesBurned, string? Notes);

        public record UpdateWorkoutExerciseRequest(int? OrderIndex, int? Sets, int? Reps, decimal? WeightKg, int? DurationSeconds, decimal? DistanceKm, decimal? CaloriesBurned, string? Notes);

        // GET: api/workoutexercise
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkoutExerciseResponse>>> GetAll()
        {
            var items = await _db.Workoutexercises.AsNoTracking()
                .OrderBy(w => w.OrderIndex)
                .Select(w => new WorkoutExerciseResponse(w.WorkoutExerciseId, w.WorkoutLogId, w.ExerciseId, w.OrderIndex, w.Sets, w.Reps, w.WeightKg, w.DurationSeconds, w.DistanceKm, w.CaloriesBurned, w.Notes, w.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/workoutexercise/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutExerciseResponse>> Get(Guid id)
        {
            var w = await _db.Workoutexercises.AsNoTracking().FirstOrDefaultAsync(x => x.WorkoutExerciseId == id);
            if (w == null) return NotFound();

            return Ok(new WorkoutExerciseResponse(w.WorkoutExerciseId, w.WorkoutLogId, w.ExerciseId, w.OrderIndex, w.Sets, w.Reps, w.WeightKg, w.DurationSeconds, w.DistanceKm, w.CaloriesBurned, w.Notes, w.CreatedAt));
        }

        // GET: api/workoutexercise/log/{workoutLogId}
        [HttpGet("log/{workoutLogId}")]
        public async Task<ActionResult<IEnumerable<WorkoutExerciseResponse>>> GetForLog(Guid workoutLogId)
        {
            var items = await _db.Workoutexercises.AsNoTracking()
                .Where(w => w.WorkoutLogId == workoutLogId)
                .OrderBy(w => w.OrderIndex)
                .Select(w => new WorkoutExerciseResponse(w.WorkoutExerciseId, w.WorkoutLogId, w.ExerciseId, w.OrderIndex, w.Sets, w.Reps, w.WeightKg, w.DurationSeconds, w.DistanceKm, w.CaloriesBurned, w.Notes, w.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/workoutexercise
        [HttpPost]
        public async Task<ActionResult<WorkoutExerciseResponse>> Create([FromBody] CreateWorkoutExerciseRequest req)
        {
            if (req == null) return BadRequest();

            // validate existence of workout log and exercise
            if (!await _db.Workoutlogs.AnyAsync(l => l.WorkoutLogId == req.WorkoutLogId)) return BadRequest("WorkoutLogId does not exist.");
            if (!await _db.Exerciselibraries.AnyAsync(e => e.ExerciseId == req.ExerciseId)) return BadRequest("ExerciseId does not exist.");

            var item = new Workoutexercise
            {
                WorkoutExerciseId = Guid.NewGuid(),
                WorkoutLogId = req.WorkoutLogId,
                ExerciseId = req.ExerciseId,
                OrderIndex = req.OrderIndex,
                Sets = req.Sets,
                Reps = req.Reps,
                WeightKg = req.WeightKg,
                DurationSeconds = req.DurationSeconds,
                DistanceKm = req.DistanceKm,
                CaloriesBurned = req.CaloriesBurned,
                Notes = req.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _db.Workoutexercises.Add(item);
            await _db.SaveChangesAsync();

            var res = new WorkoutExerciseResponse(item.WorkoutExerciseId, item.WorkoutLogId, item.ExerciseId, item.OrderIndex, item.Sets, item.Reps, item.WeightKg, item.DurationSeconds, item.DistanceKm, item.CaloriesBurned, item.Notes, item.CreatedAt);

            return CreatedAtAction(nameof(Get), new { id = item.WorkoutExerciseId }, res);
        }

        // PUT: api/workoutexercise/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWorkoutExerciseRequest req)
        {
            var item = await _db.Workoutexercises.FirstOrDefaultAsync(w => w.WorkoutExerciseId == id);
            if (item == null) return NotFound();

            if (req.OrderIndex.HasValue) item.OrderIndex = req.OrderIndex.Value;
            if (req.Sets.HasValue) item.Sets = req.Sets;
            if (req.Reps.HasValue) item.Reps = req.Reps;
            if (req.WeightKg.HasValue) item.WeightKg = req.WeightKg;
            if (req.DurationSeconds.HasValue) item.DurationSeconds = req.DurationSeconds;
            if (req.DistanceKm.HasValue) item.DistanceKm = req.DistanceKm;
            if (req.CaloriesBurned.HasValue) item.CaloriesBurned = req.CaloriesBurned;
            if (req.Notes != null) item.Notes = req.Notes;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/workoutexercise/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _db.Workoutexercises.FirstOrDefaultAsync(w => w.WorkoutExerciseId == id);
            if (item == null) return NotFound();

            _db.Workoutexercises.Remove(item);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
