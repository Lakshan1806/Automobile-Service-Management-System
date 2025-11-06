using Microsoft.AspNetCore.Mvc;
using PaymentApi.Data;
using PaymentApi.Models;
using PaymentApi.Repositories;
using PaymentApi.Extensions;
using PaymentApi.Dtos;
using Microsoft.EntityFrameworkCore;

namespace PaymentApi.Controllers
{
    [Route("api/vehicles")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<VehiclesController> _logger;

        public VehiclesController(AppDbContext context, ICustomerRepository customerRepository, ILogger<VehiclesController> logger)
        {
            _context = context;
            _customerRepository = customerRepository;
            _logger = logger;
        }

        // ✅ ADD Vehicle
        [HttpPost("add")]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleCreateDto vehicleDto)
        {
            if (vehicleDto == null)
                return BadRequest("Invalid vehicle data.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Get authenticated user's AuthUserId
                var authUserId = HttpContext.GetAuthUserId();
                
                // If no auth, try to get from the DTO (for backward compatibility)
                if (!authUserId.HasValue && vehicleDto.AuthUserId.HasValue)
                {
                    authUserId = vehicleDto.AuthUserId;
                }

                if (!authUserId.HasValue)
                {
                    return Unauthorized(new { message = "Authentication required. Please provide valid credentials or AuthUserId." });
                }

                _logger.LogInformation("Adding vehicle for AuthUserId: {AuthUserId}", authUserId.Value);

                // Get or create customer
                var customer = await _customerRepository.GetCustomerByAuthUserIdAsync(authUserId.Value);
                
                if (customer == null)
                {
                    // Create customer if doesn't exist
                    customer = await _customerRepository.UpsertCustomerAsync(
                        authUserId.Value,
                        vehicleDto.CustomerEmail ?? "unknown@example.com",
                        vehicleDto.CustomerName ?? "Unknown Customer",
                        vehicleDto.CustomerPhone
                    );
                    _logger.LogInformation("Created new customer with Id: {CustomerId}", customer.Id);
                }

                // Create vehicle
                var vehicle = new Vehicle
                {
                    VehicleId = string.IsNullOrEmpty(vehicleDto.VehicleId) ? Guid.NewGuid().ToString() : vehicleDto.VehicleId,
                    CustomerName = vehicleDto.CustomerName,
                    NoPlate = vehicleDto.NoPlate,
                    VehicleModel = vehicleDto.VehicleModel,
                    VehicleBrand = vehicleDto.VehicleBrand,
                    VehicleType = vehicleDto.VehicleType ?? "Car",
                    VehicleModelYear = vehicleDto.VehicleModelYear,
                    VehicleRegistrationYear = vehicleDto.VehicleRegistrationYear,
                    ChaseNo = vehicleDto.ChaseNo,
                    Millage = vehicleDto.Millage,
                    LastServiceDate = vehicleDto.LastServiceDate,
                    CustomerIdFk = customer.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Vehicle added successfully with Id: {VehicleId}", vehicle.VehicleId);
                
                return Ok(new { 
                    message = "Vehicle added successfully!", 
                    vehicleId = vehicle.VehicleId,
                    customerId = customer.AuthUserId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding vehicle");
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

        // ✅ GET single vehicle by ID
        [HttpGet("{vehicleId}")]
        [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetVehicle(string vehicleId)
        {
            try
            {
                var vehicle = await _context.Vehicles
                    .Include(v => v.Customer)
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);

                if (vehicle == null)
                {
                    return NotFound(new { message = $"Vehicle {vehicleId} not found" });
                }

                // Map to DTO to avoid circular reference issues
                var vehicleDto = new VehicleDto
                {
                    VehicleId = vehicle.VehicleId,
                    NoPlate = vehicle.NoPlate,
                    VehicleModel = vehicle.VehicleModel,
                    VehicleBrand = vehicle.VehicleBrand,
                    VehicleType = vehicle.VehicleType,
                    VehicleModelYear = vehicle.VehicleModelYear,
                    VehicleRegistrationYear = vehicle.VehicleRegistrationYear,
                    ChaseNo = vehicle.ChaseNo,
                    Millage = vehicle.Millage,
                    LastServiceDate = vehicle.LastServiceDate,
                    CustomerId = vehicle.Customer.AuthUserId,
                    CustomerName = vehicle.Customer.Name,
                    CustomerEmail = vehicle.Customer.Email,
                    CustomerPhone = vehicle.Customer.Phone
                };

                return Ok(vehicleDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicle: {VehicleId}", vehicleId);
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // ✅ UPDATE vehicle
        [HttpPut("update/{id}")]
        public IActionResult UpdateVehicle(string id, [FromBody] Vehicle updated)
        {
            var vehicle = _context.Vehicles.FirstOrDefault(v => v.VehicleId == id);
            if (vehicle == null)
                return NotFound("Vehicle not found.");

            // update fields
            vehicle.CustomerName = updated.CustomerName;
            vehicle.NoPlate = updated.NoPlate;
            vehicle.VehicleModel = updated.VehicleModel;
            vehicle.VehicleBrand = updated.VehicleBrand;
            vehicle.VehicleType = updated.VehicleType;
            vehicle.VehicleModelYear = updated.VehicleModelYear;
            vehicle.VehicleRegistrationYear = updated.VehicleRegistrationYear;
            vehicle.CustomerIdFk = updated.CustomerIdFk;
            vehicle.Millage = updated.Millage;
            vehicle.LastServiceDate = updated.LastServiceDate;
            vehicle.ChaseNo = updated.ChaseNo;

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

        /// <summary>
        /// Get combined appointment details for a vehicle (vehicle + owner info)
        /// </summary>
        /// <param name="vehicleId">The vehicle ID</param>
        /// <returns>Appointment details DTO</returns>
        [HttpGet("{vehicleId}/appointment-details")]
        [ProducesResponseType(typeof(Dtos.AppointmentDetailsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAppointmentDetails(string vehicleId)
        {
            try
            {
                _logger.LogInformation("Fetching appointment details for vehicleId: {VehicleId}", vehicleId);

                var details = await _customerRepository.GetAppointmentDetailsAsync(vehicleId);
                
                if (details == null)
                {
                    _logger.LogWarning("Vehicle not found: {VehicleId}", vehicleId);
                    return NotFound(new { message = $"Vehicle {vehicleId} not found" });
                }

                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching appointment details for vehicleId: {VehicleId}", vehicleId);
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Internal Server Error"
                );
            }
        }

        /// <summary>
        /// Create a test customer for development/testing
        /// </summary>
        [HttpPost("test-customer")]
        public async Task<IActionResult> CreateTestCustomer([FromBody] TestCustomerDto dto)
        {
            try
            {
                var customer = await _customerRepository.UpsertCustomerAsync(
                    dto.AuthUserId,
                    dto.Email,
                    dto.Name,
                    dto.Phone
                );

                return Ok(new
                {
                    message = "Test customer created successfully!",
                    customerId = customer.Id,
                    authUserId = customer.AuthUserId,
                    name = customer.Name,
                    email = customer.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test customer");
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }
    }

    public class TestCustomerDto
    {
        public long AuthUserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }
}
