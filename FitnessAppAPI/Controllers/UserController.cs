using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitnessAppAPI.Models;

namespace FitnessAppAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly FitnesstrackerdbContext _db;
        private readonly IConfiguration _config;

        public UserController(FitnesstrackerdbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // DTOs
        public record UserResponse(Guid UserId, string Username, string Email, bool? IsActive, bool IsEmailVerified, DateTime? LastLoginAt, DateTime CreatedAt, DateTime UpdatedAt);

        public record CreateUserRequest(string Username, string Email, string Password);

        public record LoginRequest(string Email, string Password);

        public record UpdateUserRequest(string? Username, string? Email, string? Password, bool? IsActive, bool? IsEmailVerified);

        // GET: api/user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
        {
            var users = await _db.Users.AsNoTracking()
                .Select(u => new UserResponse(u.UserId, u.Username, u.Email, u.IsActive, u.IsEmailVerified, u.LastLoginAt, u.CreatedAt, u.UpdatedAt))
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(Guid id)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            return Ok(new UserResponse(user.UserId, user.Username, user.Email, user.IsActive, user.IsEmailVerified, user.LastLoginAt, user.CreatedAt, user.UpdatedAt));
        }

        // POST: api/user
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Username, Email and Password are required.");

            // Check unique constraints
            if (await _db.Users.AnyAsync(u => u.Email == req.Email)) return Conflict("Email already in use.");
            if (await _db.Users.AnyAsync(u => u.Username == req.Username)) return Conflict("Username already in use.");

            var user = new User
            {
                UserId = Guid.NewGuid(),
                Username = req.Username,
                Email = req.Email,
                PasswordHash = ComputeSha256Hash(req.Password),
                IsActive = true,
                IsEmailVerified = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var res = new UserResponse(user.UserId, user.Username, user.Email, user.IsActive, user.IsEmailVerified, user.LastLoginAt, user.CreatedAt, user.UpdatedAt);

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, res);
        }

        // POST: api/user/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password)) return BadRequest();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Unauthorized();

            var hash = ComputeSha256Hash(req.Password);
            if (!string.Equals(hash, user.PasswordHash, StringComparison.OrdinalIgnoreCase)) return Unauthorized();

            if (user.IsActive.HasValue && !user.IsActive.Value) return Forbid();

            // create JWT
            var key = _config["Jwt:Key"] ?? "dev_secret_change_me_please_!123";
            var issuer = _config["Jwt:Issuer"] ?? "FitnessAppAPI";
            var audience = _config["Jwt:Audience"] ?? "FitnessAppAPI";

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("username", user.Username)
            };

            var expires = DateTime.UtcNow.AddDays(7);
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, expires: expires, signingCredentials: creds);
            var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);

            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { token = tokenStr, expires });
        }

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
            {
                if (await _db.Users.AnyAsync(u => u.Username == req.Username && u.UserId != id)) return Conflict("Username already in use.");
                user.Username = req.Username;
            }

            if (!string.IsNullOrWhiteSpace(req.Email) && req.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(u => u.Email == req.Email && u.UserId != id)) return Conflict("Email already in use.");
                user.Email = req.Email;
            }

            if (!string.IsNullOrWhiteSpace(req.Password))
            {
                user.PasswordHash = ComputeSha256Hash(req.Password);
            }

            if (req.IsActive.HasValue) user.IsActive = req.IsActive;
            if (req.IsEmailVerified.HasValue) user.IsEmailVerified = req.IsEmailVerified.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static string ComputeSha256Hash(string rawData)
        {
            using var sha256Hash = SHA256.Create();
            var bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var builder = new StringBuilder();
            foreach (var t in bytes)
            {
                builder.Append(t.ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
