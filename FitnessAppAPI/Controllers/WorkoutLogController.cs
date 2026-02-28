using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutLogController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public WorkoutLogController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record WorkoutLogResponse(Guid WorkoutLogId, Guid UserId, DateTime WorkoutDate, DateTime StartTime, DateTime? EndTime, int? DurationMinutes, decimal? TotalCaloriesBurned, string WorkoutType, string? Notes, DateTime CreatedAt);

        public record CreateWorkoutLogRequest(Guid UserId, DateTime WorkoutDate, DateTime StartTime, DateTime? EndTime, int? DurationMinutes, decimal? TotalCaloriesBurned, string WorkoutType, string? Notes);

        public record UpdateWorkoutLogRequest(DateTime? WorkoutDate, DateTime? StartTime, DateTime? EndTime, int? DurationMinutes, decimal? TotalCaloriesBurned, string? WorkoutType, string? Notes);

        // GET: api/workoutlog
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkoutLogResponse>>> GetLogs()
        {
            var items = await _db.Workoutlogs.AsNoTracking()
                .OrderByDescending(w => w.WorkoutDate)
                .Select(w => new WorkoutLogResponse(w.WorkoutLogId, w.UserId, w.WorkoutDate, w.StartTime, w.EndTime, w.DurationMinutes, w.TotalCaloriesBurned, w.WorkoutType, w.Notes, w.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/workoutlog/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutLogResponse>> GetLog(Guid id)
        {
            var w = await _db.Workoutlogs.AsNoTracking().FirstOrDefaultAsync(x => x.WorkoutLogId == id);
            if (w == null) return NotFound();

            return Ok(new WorkoutLogResponse(w.WorkoutLogId, w.UserId, w.WorkoutDate, w.StartTime, w.EndTime, w.DurationMinutes, w.TotalCaloriesBurned, w.WorkoutType, w.Notes, w.CreatedAt));
        }

        // GET: api/workoutlog/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<WorkoutLogResponse>>> GetLogsForUser(Guid userId)
        {
            var items = await _db.Workoutlogs.AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.WorkoutDate)
                .Select(w => new WorkoutLogResponse(w.WorkoutLogId, w.UserId, w.WorkoutDate, w.StartTime, w.EndTime, w.DurationMinutes, w.TotalCaloriesBurned, w.WorkoutType, w.Notes, w.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/workoutlog
        [HttpPost]
        public async Task<ActionResult<WorkoutLogResponse>> CreateLog([FromBody] CreateWorkoutLogRequest req)
        {
            if (req == null) return BadRequest();

            if (!await _db.Users.AnyAsync(u => u.UserId == req.UserId)) return BadRequest("UserId does not exist.");

            var log = new Workoutlog
            {
                WorkoutLogId = Guid.NewGuid(),
                UserId = req.UserId,
                WorkoutDate = req.WorkoutDate.Date,
                StartTime = req.StartTime,
                EndTime = req.EndTime,
                DurationMinutes = req.DurationMinutes,
                TotalCaloriesBurned = req.TotalCaloriesBurned,
                WorkoutType = req.WorkoutType,
                Notes = req.Notes,
                CreatedAt = DateTime.UtcNow
            };

            // If duration not provided but start and end are, compute
            if (!log.DurationMinutes.HasValue && log.EndTime.HasValue)
            {
                var diff = log.EndTime.Value - log.StartTime;
                log.DurationMinutes = (int)diff.TotalMinutes;
            }

            _db.Workoutlogs.Add(log);
            await _db.SaveChangesAsync();

            var res = new WorkoutLogResponse(log.WorkoutLogId, log.UserId, log.WorkoutDate, log.StartTime, log.EndTime, log.DurationMinutes, log.TotalCaloriesBurned, log.WorkoutType, log.Notes, log.CreatedAt);

            return CreatedAtAction(nameof(GetLog), new { id = log.WorkoutLogId }, res);
        }

        // PUT: api/workoutlog/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLog(Guid id, [FromBody] UpdateWorkoutLogRequest req)
        {
            var log = await _db.Workoutlogs.FirstOrDefaultAsync(w => w.WorkoutLogId == id);
            if (log == null) return NotFound();

            if (req.WorkoutDate.HasValue) log.WorkoutDate = req.WorkoutDate.Value.Date;
            if (req.StartTime.HasValue) log.StartTime = req.StartTime.Value;
            if (req.EndTime.HasValue) log.EndTime = req.EndTime.Value;
            if (req.DurationMinutes.HasValue) log.DurationMinutes = req.DurationMinutes.Value;
            if (req.TotalCaloriesBurned.HasValue) log.TotalCaloriesBurned = req.TotalCaloriesBurned.Value;
            if (!string.IsNullOrWhiteSpace(req.WorkoutType)) log.WorkoutType = req.WorkoutType;
            if (req.Notes != null) log.Notes = req.Notes;

            // Recompute duration if end/start present and duration not explicitly set
            if (!req.DurationMinutes.HasValue && log.EndTime.HasValue)
            {
                var diff = log.EndTime.Value - log.StartTime;
                log.DurationMinutes = (int)diff.TotalMinutes;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/workoutlog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLog(Guid id)
        {
            var log = await _db.Workoutlogs.FirstOrDefaultAsync(w => w.WorkoutLogId == id);
            if (log == null) return NotFound();

            _db.Workoutlogs.Remove(log);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
