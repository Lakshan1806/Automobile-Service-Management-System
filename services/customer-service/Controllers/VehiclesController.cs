using Microsoft.AspNetCore.Mvc;
using PaymentApi.Data;
using PaymentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace PaymentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehiclesController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ ADD Vehicle
        [HttpPost("add")]
        public IActionResult AddVehicle([FromBody] Vehicle vehicle)
        {
            if (vehicle == null)
                return BadRequest("Invalid vehicle data.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _context.Vehicles.Add(vehicle);
                _context.SaveChanges();
                return Ok(new { message = "Vehicle added successfully!", vehicle });
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // ✅ GET all vehicles
        [HttpGet]
        public async Task<IActionResult> GetAllVehicles()
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }

        // ✅ UPDATE vehicle
        [HttpPut("update/{id}")]
        public IActionResult UpdateVehicle(string id, [FromBody] Vehicle updated)
        {
            var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
            if (vehicle == null)
                return NotFound("Vehicle not found.");

            // update fields
            vehicle.VehicleNo = updated.VehicleNo;
            vehicle.VehicleModel = updated.VehicleModel;
            vehicle.Brand = updated.Brand;
            vehicle.CustomerId = updated.CustomerId;
            vehicle.Mileage = updated.Mileage;
            vehicle.LastServiceDate = updated.LastServiceDate;
            vehicle.ChassisNo = updated.ChassisNo;
            vehicle.CustomerPhone = updated.CustomerPhone;

            try
            {
                _context.SaveChanges();
                return Ok(new { message = "Vehicle updated successfully!", vehicle });
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // ✅ DELETE vehicle
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteVehicle(string id)
        {
            var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
            if (vehicle == null)
                return NotFound("Vehicle not found.");

            _context.Vehicles.Remove(vehicle);
            _context.SaveChanges();
            return Ok(new { message = "Vehicle deleted successfully!" });
        }
    }
}
