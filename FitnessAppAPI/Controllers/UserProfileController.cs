using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;

        public UserProfileController(FitnesstrackerdbContext db)
        {
            _db = db;
        }

        // DTOs
        public record UserProfileResponse(Guid ProfileId, Guid UserId, string FirstName, string LastName, DateTime DateOfBirth, string? Gender, decimal? HeightCm, decimal? CurrentWeightKg, decimal? TargetWeightKg, string ActivityLevel, string PreferredUnits, string? ProfilePicUrl, DateTime UpdatedAt);

        public record CreateUserProfileRequest(Guid UserId, string FirstName, string LastName, DateTime DateOfBirth, string? Gender, decimal? HeightCm, decimal? CurrentWeightKg, decimal? TargetWeightKg, string? ActivityLevel, string? PreferredUnits, string? ProfilePicUrl);

        public record UpdateUserProfileRequest(string? FirstName, string? LastName, DateTime? DateOfBirth, string? Gender, decimal? HeightCm, decimal? CurrentWeightKg, decimal? TargetWeightKg, string? ActivityLevel, string? PreferredUnits, string? ProfilePicUrl);

        // GET: api/userprofile
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserProfileResponse>>> GetProfiles()
        {
            var profiles = await _db.Userprofiles.AsNoTracking()
                .Select(p => new UserProfileResponse(p.ProfileId, p.UserId, p.FirstName, p.LastName, p.DateOfBirth, p.Gender, p.HeightCm, p.CurrentWeightKg, p.TargetWeightKg, p.ActivityLevel, p.PreferredUnits, p.ProfilePicUrl, p.UpdatedAt))
                .ToListAsync();

            return Ok(profiles);
        }

        // GET: api/userprofile/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfileResponse>> GetProfile(Guid id)
        {
            var p = await _db.Userprofiles.AsNoTracking().FirstOrDefaultAsync(x => x.ProfileId == id);
            if (p == null) return NotFound();

            return Ok(new UserProfileResponse(p.ProfileId, p.UserId, p.FirstName, p.LastName, p.DateOfBirth, p.Gender, p.HeightCm, p.CurrentWeightKg, p.TargetWeightKg, p.ActivityLevel, p.PreferredUnits, p.ProfilePicUrl, p.UpdatedAt));
        }

        // GET: api/userprofile/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<UserProfileResponse>> GetProfileByUser(Guid userId)
        {
            var p = await _db.Userprofiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
            if (p == null) return NotFound();

            return Ok(new UserProfileResponse(p.ProfileId, p.UserId, p.FirstName, p.LastName, p.DateOfBirth, p.Gender, p.HeightCm, p.CurrentWeightKg, p.TargetWeightKg, p.ActivityLevel, p.PreferredUnits, p.ProfilePicUrl, p.UpdatedAt));
        }

        // POST: api/userprofile
        [HttpPost]
        public async Task<ActionResult<UserProfileResponse>> CreateProfile([FromBody] CreateUserProfileRequest req)
        {
            // Basic validation
            if (req == null) return BadRequest();

            // Ensure the referenced user exists
            if (!await _db.Users.AnyAsync(u => u.UserId == req.UserId)) return BadRequest("UserId does not exist.");

            // Ensure unique profile per user
            if (await _db.Userprofiles.AnyAsync(p => p.UserId == req.UserId)) return Conflict("Profile for user already exists.");

            var profile = new Userprofile
            {
                ProfileId = Guid.NewGuid(),
                UserId = req.UserId,
                FirstName = req.FirstName,
                LastName = req.LastName,
                DateOfBirth = req.DateOfBirth,
                Gender = req.Gender,
                HeightCm = req.HeightCm,
                CurrentWeightKg = req.CurrentWeightKg,
                TargetWeightKg = req.TargetWeightKg,
                ActivityLevel = string.IsNullOrWhiteSpace(req.ActivityLevel) ? "Moderate" : req.ActivityLevel,
                PreferredUnits = string.IsNullOrWhiteSpace(req.PreferredUnits) ? "Metric" : req.PreferredUnits,
                ProfilePicUrl = req.ProfilePicUrl,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Userprofiles.Add(profile);
            await _db.SaveChangesAsync();

            var res = new UserProfileResponse(profile.ProfileId, profile.UserId, profile.FirstName, profile.LastName, profile.DateOfBirth, profile.Gender, profile.HeightCm, profile.CurrentWeightKg, profile.TargetWeightKg, profile.ActivityLevel, profile.PreferredUnits, profile.ProfilePicUrl, profile.UpdatedAt);

            return CreatedAtAction(nameof(GetProfile), new { id = profile.ProfileId }, res);
        }

        // PUT: api/userprofile/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserProfileRequest req)
        {
            var profile = await _db.Userprofiles.FirstOrDefaultAsync(p => p.ProfileId == id);
            if (profile == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.FirstName)) profile.FirstName = req.FirstName;
            if (!string.IsNullOrWhiteSpace(req.LastName)) profile.LastName = req.LastName;
            if (req.DateOfBirth.HasValue) profile.DateOfBirth = req.DateOfBirth.Value;
            if (req.Gender != null) profile.Gender = req.Gender;
            if (req.HeightCm.HasValue) profile.HeightCm = req.HeightCm;
            if (req.CurrentWeightKg.HasValue) profile.CurrentWeightKg = req.CurrentWeightKg;
            if (req.TargetWeightKg.HasValue) profile.TargetWeightKg = req.TargetWeightKg;
            if (!string.IsNullOrWhiteSpace(req.ActivityLevel)) profile.ActivityLevel = req.ActivityLevel;
            if (!string.IsNullOrWhiteSpace(req.PreferredUnits)) profile.PreferredUnits = req.PreferredUnits;
            if (req.ProfilePicUrl != null) profile.ProfilePicUrl = req.ProfilePicUrl;

            profile.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/userprofile/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(Guid id)
        {
            var profile = await _db.Userprofiles.FirstOrDefaultAsync(p => p.ProfileId == id);
            if (profile == null) return NotFound();

            _db.Userprofiles.Remove(profile);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
