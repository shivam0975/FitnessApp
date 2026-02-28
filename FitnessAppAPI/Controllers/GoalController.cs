using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoalController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public GoalController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record GoalResponse(Guid GoalId, Guid UserId, string GoalType, string GoalName, decimal TargetValue, decimal CurrentValue, string Unit, DateTime StartDate, DateTime TargetDate, string Status, DateTime CreatedAt, DateTime UpdatedAt);

        public record CreateGoalRequest(Guid UserId, string GoalType, string GoalName, decimal TargetValue, decimal CurrentValue, string Unit, DateTime StartDate, DateTime TargetDate, string? Status);

        public record UpdateGoalRequest(string? GoalType, string? GoalName, decimal? TargetValue, decimal? CurrentValue, string? Unit, DateTime? StartDate, DateTime? TargetDate, string? Status);

        // GET: api/goal
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GoalResponse>>> GetGoals()
        {
            var items = await _db.Goals.AsNoTracking()
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new GoalResponse(g.GoalId, g.UserId, g.GoalType, g.GoalName, g.TargetValue, g.CurrentValue, g.Unit, g.StartDate, g.TargetDate, g.Status, g.CreatedAt, g.UpdatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/goal/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<GoalResponse>> GetGoal(Guid id)
        {
            var g = await _db.Goals.AsNoTracking().FirstOrDefaultAsync(x => x.GoalId == id);
            if (g == null) return NotFound();

            return Ok(new GoalResponse(g.GoalId, g.UserId, g.GoalType, g.GoalName, g.TargetValue, g.CurrentValue, g.Unit, g.StartDate, g.TargetDate, g.Status, g.CreatedAt, g.UpdatedAt));
        }

        // GET: api/goal/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<GoalResponse>>> GetGoalsForUser(Guid userId)
        {
            var items = await _db.Goals.AsNoTracking()
                .Where(g => g.UserId == userId)
                .OrderBy(g => g.TargetDate)
                .Select(g => new GoalResponse(g.GoalId, g.UserId, g.GoalType, g.GoalName, g.TargetValue, g.CurrentValue, g.Unit, g.StartDate, g.TargetDate, g.Status, g.CreatedAt, g.UpdatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/goal
        [HttpPost]
        public async Task<ActionResult<GoalResponse>> CreateGoal([FromBody] CreateGoalRequest req)
        {
            if (req == null) return BadRequest();

            // ensure user exists
            if (!await _db.Users.AnyAsync(u => u.UserId == req.UserId)) return BadRequest("UserId does not exist.");

            var goal = new Goal
            {
                GoalId = Guid.NewGuid(),
                UserId = req.UserId,
                GoalType = req.GoalType,
                GoalName = req.GoalName,
                TargetValue = req.TargetValue,
                CurrentValue = req.CurrentValue,
                Unit = req.Unit,
                StartDate = req.StartDate.Date,
                TargetDate = req.TargetDate.Date,
                Status = string.IsNullOrWhiteSpace(req.Status) ? "Active" : req.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Goals.Add(goal);
            await _db.SaveChangesAsync();

            var res = new GoalResponse(goal.GoalId, goal.UserId, goal.GoalType, goal.GoalName, goal.TargetValue, goal.CurrentValue, goal.Unit, goal.StartDate, goal.TargetDate, goal.Status, goal.CreatedAt, goal.UpdatedAt);

            return CreatedAtAction(nameof(GetGoal), new { id = goal.GoalId }, res);
        }

        // PUT: api/goal/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(Guid id, [FromBody] UpdateGoalRequest req)
        {
            var goal = await _db.Goals.FirstOrDefaultAsync(g => g.GoalId == id);
            if (goal == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.GoalType)) goal.GoalType = req.GoalType;
            if (!string.IsNullOrWhiteSpace(req.GoalName)) goal.GoalName = req.GoalName;
            if (req.TargetValue.HasValue) goal.TargetValue = req.TargetValue.Value;
            if (req.CurrentValue.HasValue) goal.CurrentValue = req.CurrentValue.Value;
            if (!string.IsNullOrWhiteSpace(req.Unit)) goal.Unit = req.Unit;
            if (req.StartDate.HasValue) goal.StartDate = req.StartDate.Value.Date;
            if (req.TargetDate.HasValue) goal.TargetDate = req.TargetDate.Value.Date;
            if (!string.IsNullOrWhiteSpace(req.Status)) goal.Status = req.Status;

            goal.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/goal/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(Guid id)
        {
            var goal = await _db.Goals.FirstOrDefaultAsync(g => g.GoalId == id);
            if (goal == null) return NotFound();

            _db.Goals.Remove(goal);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
