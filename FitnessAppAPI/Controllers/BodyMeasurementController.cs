using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BodyMeasurementController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public BodyMeasurementController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record BodyMeasurementResponse(Guid MeasurementId, Guid UserId, DateTime MeasuredAt, decimal? WeightKg, decimal? BodyFatPercent, decimal? WaistCm, decimal? HipsCm, decimal? BicepCm, decimal? ChestCm, string? Notes, DateTime CreatedAt);

        public record CreateBodyMeasurementRequest(Guid UserId, DateTime MeasuredAt, decimal? WeightKg, decimal? BodyFatPercent, decimal? WaistCm, decimal? HipsCm, decimal? BicepCm, decimal? ChestCm, string? Notes);

        public record UpdateBodyMeasurementRequest(DateTime? MeasuredAt, decimal? WeightKg, decimal? BodyFatPercent, decimal? WaistCm, decimal? HipsCm, decimal? BicepCm, decimal? ChestCm, string? Notes);

        // GET: api/bodymeasurement
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BodyMeasurementResponse>>> GetMeasurements()
        {
            var items = await _db.Bodymeasurements.AsNoTracking()
                .Select(b => new BodyMeasurementResponse(b.MeasurementId, b.UserId, b.MeasuredAt, b.WeightKg, b.BodyFatPercent, b.WaistCm, b.HipsCm, b.BicepCm, b.ChestCm, b.Notes, b.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/bodymeasurement/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BodyMeasurementResponse>> GetMeasurement(Guid id)
        {
            var b = await _db.Bodymeasurements.AsNoTracking().FirstOrDefaultAsync(x => x.MeasurementId == id);
            if (b == null) return NotFound();

            return Ok(new BodyMeasurementResponse(b.MeasurementId, b.UserId, b.MeasuredAt, b.WeightKg, b.BodyFatPercent, b.WaistCm, b.HipsCm, b.BicepCm, b.ChestCm, b.Notes, b.CreatedAt));
        }

        // GET: api/bodymeasurement/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<BodyMeasurementResponse>>> GetMeasurementsForUser(Guid userId)
        {
            var items = await _db.Bodymeasurements.AsNoTracking()
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.MeasuredAt)
                .Select(b => new BodyMeasurementResponse(b.MeasurementId, b.UserId, b.MeasuredAt, b.WeightKg, b.BodyFatPercent, b.WaistCm, b.HipsCm, b.BicepCm, b.ChestCm, b.Notes, b.CreatedAt))
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/bodymeasurement
        [HttpPost]
        public async Task<ActionResult<BodyMeasurementResponse>> CreateMeasurement([FromBody] CreateBodyMeasurementRequest req)
        {
            if (req == null) return BadRequest();

            // Ensure user exists
            if (!await _db.Users.AnyAsync(u => u.UserId == req.UserId)) return BadRequest("UserId does not exist.");

            var measurement = new Bodymeasurement
            {
                MeasurementId = Guid.NewGuid(),
                UserId = req.UserId,
                MeasuredAt = req.MeasuredAt.Date,
                WeightKg = req.WeightKg,
                BodyFatPercent = req.BodyFatPercent,
                WaistCm = req.WaistCm,
                HipsCm = req.HipsCm,
                BicepCm = req.BicepCm,
                ChestCm = req.ChestCm,
                Notes = req.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _db.Bodymeasurements.Add(measurement);
            await _db.SaveChangesAsync();

            var res = new BodyMeasurementResponse(measurement.MeasurementId, measurement.UserId, measurement.MeasuredAt, measurement.WeightKg, measurement.BodyFatPercent, measurement.WaistCm, measurement.HipsCm, measurement.BicepCm, measurement.ChestCm, measurement.Notes, measurement.CreatedAt);

            return CreatedAtAction(nameof(GetMeasurement), new { id = measurement.MeasurementId }, res);
        }

        // PUT: api/bodymeasurement/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeasurement(Guid id, [FromBody] UpdateBodyMeasurementRequest req)
        {
            var measurement = await _db.Bodymeasurements.FirstOrDefaultAsync(b => b.MeasurementId == id);
            if (measurement == null) return NotFound();

            if (req.MeasuredAt.HasValue) measurement.MeasuredAt = req.MeasuredAt.Value.Date;
            if (req.WeightKg.HasValue) measurement.WeightKg = req.WeightKg;
            if (req.BodyFatPercent.HasValue) measurement.BodyFatPercent = req.BodyFatPercent;
            if (req.WaistCm.HasValue) measurement.WaistCm = req.WaistCm;
            if (req.HipsCm.HasValue) measurement.HipsCm = req.HipsCm;
            if (req.BicepCm.HasValue) measurement.BicepCm = req.BicepCm;
            if (req.ChestCm.HasValue) measurement.ChestCm = req.ChestCm;
            if (req.Notes != null) measurement.Notes = req.Notes;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/bodymeasurement/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeasurement(Guid id)
        {
            var measurement = await _db.Bodymeasurements.FirstOrDefaultAsync(b => b.MeasurementId == id);
            if (measurement == null) return NotFound();

            _db.Bodymeasurements.Remove(measurement);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
