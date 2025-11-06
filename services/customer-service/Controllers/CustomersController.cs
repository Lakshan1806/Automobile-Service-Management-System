using Microsoft.AspNetCore.Mvc;
using PaymentApi.Repositories;
using PaymentApi.Extensions;

namespace PaymentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(ICustomerRepository customerRepository, ILogger<CustomersController> logger)
        {
            _customerRepository = customerRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all vehicles for a customer by their AuthUserId
        /// </summary>
        /// <param name="customerId">The AuthUserId from the authentication service</param>
        /// <returns>List of vehicle summaries</returns>
        [HttpGet("{customerId}/vehicles")]
        [ProducesResponseType(typeof(IEnumerable<Dtos.VehicleSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetVehicles(long customerId)
        {
            try
            {
                _logger.LogInformation("Fetching vehicles for customerId (AuthUserId): {CustomerId}", customerId);

                var vehicles = await _customerRepository.GetVehiclesByAuthUserIdAsync(customerId);
                
                if (!vehicles.Any())
                {
                    _logger.LogInformation("No vehicles found for customerId: {CustomerId}", customerId);
                    return NotFound(new { message = $"No vehicles found for customer {customerId}" });
                }

                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicles for customerId: {CustomerId}", customerId);
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Internal Server Error"
                );
            }
        }
    }
}
