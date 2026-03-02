using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NutritionLogController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public NutritionLogController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record NutritionLogResponse(Guid NutritionLogId, Guid UserId, DateTime LogDate, string MealType, string FoodName, decimal ServingAmount, string ServingUnit, decimal CaloriesKcal, decimal? ProteinG, decimal? CarbsG, decimal? FatG, DateTime CreatedAt);

        public record CreateNutritionLogRequest(Guid UserId, DateTime LogDate, string MealType, string FoodName, decimal ServingAmount, string ServingUnit, decimal CaloriesKcal, decimal? ProteinG, decimal? CarbsG, decimal? FatG);

        public record UpdateNutritionLogRequest(DateTime? LogDate, string? MealType, string? FoodName, decimal? ServingAmount, string? ServingUnit, decimal? CaloriesKcal, decimal? ProteinG, decimal? CarbsG, decimal? FatG);

        // GET: api/nutritionlog
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NutritionLogResponse>>> GetLogs()
        {
            var items = await _db.Nutritionlogs.AsNoTracking()
                .OrderByDescending(n => n.LogDate)
                .Select(n => new NutritionLogResponse(n.NutritionLogId, n.UserId, n.LogDate, n.MealType, n.FoodName, n.ServingAmount, n.ServingUnit, n.CaloriesKcal, n.ProteinG, n.CarbsG, n.FatG, n.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/nutritionlog/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<NutritionLogResponse>> GetLog(Guid id)
        {
            var n = await _db.Nutritionlogs.AsNoTracking().FirstOrDefaultAsync(x => x.NutritionLogId == id);
            if (n == null) return NotFound();

            return Ok(new NutritionLogResponse(n.NutritionLogId, n.UserId, n.LogDate, n.MealType, n.FoodName, n.ServingAmount, n.ServingUnit, n.CaloriesKcal, n.ProteinG, n.CarbsG, n.FatG, n.CreatedAt));
        }

        // GET: api/nutritionlog/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<NutritionLogResponse>>> GetLogsForUser(Guid userId)
        {
            var items = await _db.Nutritionlogs.AsNoTracking()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.LogDate)
                .Select(n => new NutritionLogResponse(n.NutritionLogId, n.UserId, n.LogDate, n.MealType, n.FoodName, n.ServingAmount, n.ServingUnit, n.CaloriesKcal, n.ProteinG, n.CarbsG, n.FatG, n.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/nutritionlog
        [HttpPost]
        public async Task<ActionResult<NutritionLogResponse>> CreateLog([FromBody] CreateNutritionLogRequest req)
        {
            if (req == null) return BadRequest();

            if (!await _db.Users.AnyAsync(u => u.UserId == req.UserId)) return BadRequest("UserId does not exist.");

            var log = new Nutritionlog
            {
                NutritionLogId = Guid.NewGuid(),
                UserId = req.UserId,
                LogDate = req.LogDate.Date,
                MealType = req.MealType,
                FoodName = req.FoodName,
                ServingAmount = req.ServingAmount,
                ServingUnit = req.ServingUnit,
                CaloriesKcal = req.CaloriesKcal,
                ProteinG = req.ProteinG,
                CarbsG = req.CarbsG,
                FatG = req.FatG,
                CreatedAt = DateTime.UtcNow
            };

            _db.Nutritionlogs.Add(log);
            await _db.SaveChangesAsync();

            var res = new NutritionLogResponse(log.NutritionLogId, log.UserId, log.LogDate, log.MealType, log.FoodName, log.ServingAmount, log.ServingUnit, log.CaloriesKcal, log.ProteinG, log.CarbsG, log.FatG, log.CreatedAt);

            return CreatedAtAction(nameof(GetLog), new { id = log.NutritionLogId }, res);
        }

        // PUT: api/nutritionlog/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLog(Guid id, [FromBody] UpdateNutritionLogRequest req)
        {
            var log = await _db.Nutritionlogs.FirstOrDefaultAsync(n => n.NutritionLogId == id);
            if (log == null) return NotFound();

            if (req.LogDate.HasValue) log.LogDate = req.LogDate.Value.Date;
            if (!string.IsNullOrWhiteSpace(req.MealType)) log.MealType = req.MealType;
            if (!string.IsNullOrWhiteSpace(req.FoodName)) log.FoodName = req.FoodName;
            if (req.ServingAmount.HasValue) log.ServingAmount = req.ServingAmount.Value;
            if (!string.IsNullOrWhiteSpace(req.ServingUnit)) log.ServingUnit = req.ServingUnit;
            if (req.CaloriesKcal.HasValue) log.CaloriesKcal = req.CaloriesKcal.Value;
            if (req.ProteinG.HasValue) log.ProteinG = req.ProteinG;
            if (req.CarbsG.HasValue) log.CarbsG = req.CarbsG;
            if (req.FatG.HasValue) log.FatG = req.FatG;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/nutritionlog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLog(Guid id)
        {
            var log = await _db.Nutritionlogs.FirstOrDefaultAsync(n => n.NutritionLogId == id);
            if (log == null) return NotFound();

            _db.Nutritionlogs.Remove(log);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
