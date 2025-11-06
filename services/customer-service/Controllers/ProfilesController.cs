using Microsoft.AspNetCore.Mvc;
using PaymentApi.Data;
using PaymentApi.Models;
using System.Linq;

namespace PaymentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfilesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfilesController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Save or Update
        [HttpPost("save")]
        public IActionResult SaveProfile([FromBody] Profile profile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = _context.Profiles.FirstOrDefault(p => p.ProfileId == profile.ProfileId);
            if (existing != null)
            {
                existing.Name = profile.Name;
                existing.Email = profile.Email;
                existing.Phone = profile.Phone;
                existing.Address = profile.Address;
                _context.SaveChanges();
                return Ok(new { message = "Profile updated successfully!" });
            }

            _context.Profiles.Add(profile);
            _context.SaveChanges();
            return Ok(new { message = "Profile created successfully!" });
        }

        // ✅ Fetch one profile
        [HttpGet("{id}")]
        public IActionResult GetProfile(string id)
        {
            var profile = _context.Profiles.FirstOrDefault(p => p.ProfileId == id);
            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }

        // ✅ Get all profiles (optional)
        [HttpGet]
        public IActionResult GetAllProfiles()
        {
            return Ok(_context.Profiles.ToList());
        }
    }
}
