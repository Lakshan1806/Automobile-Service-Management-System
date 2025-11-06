using Microsoft.EntityFrameworkCore;
using PaymentApi.Data;
using PaymentApi.Dtos;
using PaymentApi.Models;

namespace PaymentApi.Repositories
{
    /// <summary>
    /// Repository implementation for customer-related operations
    /// </summary>
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CustomerRepository> _logger;

        public CustomerRepository(AppDbContext context, ILogger<CustomerRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleSummaryDto>> GetVehiclesByAuthUserIdAsync(long authUserId)
        {
            var customer = await _context.Customers
                .Include(c => c.Vehicles)
                .FirstOrDefaultAsync(c => c.AuthUserId == authUserId);

            if (customer == null)
            {
                return Enumerable.Empty<VehicleSummaryDto>();
            }

            return customer.Vehicles.Select(v => new VehicleSummaryDto
            {
                vehicleId = v.VehicleId,
                noPlate = v.NoPlate,
                vehicleBrand = v.VehicleBrand,
                vehicleModel = v.VehicleModel
            });
        }

        public async Task<AppointmentDetailsDto?> GetAppointmentDetailsAsync(string vehicleId)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.Customer)
                .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);

            if (vehicle == null)
            {
                return null;
            }

            return new AppointmentDetailsDto
            {
                vehicleId = vehicle.VehicleId,
                noPlate = vehicle.NoPlate,
                chaseNo = vehicle.ChaseNo ?? "",
                vehicleType = vehicle.VehicleType ?? "Car",
                vehicleBrand = vehicle.VehicleBrand,
                customerId = vehicle.Customer.AuthUserId.ToString(),
                customerPhone = vehicle.Customer.Phone ?? "",
                customerName = vehicle.Customer.Name,
                millage = vehicle.Millage,
                lastServiceDate = vehicle.LastServiceDate?.ToString("yyyy-MM-dd") ?? "",
                vehicleModelYear = vehicle.VehicleModelYear,
                vehicleRegistrationYear = vehicle.VehicleRegistrationYear
            };
        }

        public async Task<Customer?> GetCustomerByAuthUserIdAsync(long authUserId)
        {
            return await _context.Customers
                .FirstOrDefaultAsync(c => c.AuthUserId == authUserId);
        }

        public async Task<Customer> UpsertCustomerAsync(long authUserId, string email, string name, string? phone = null)
        {
            var customer = await GetCustomerByAuthUserIdAsync(authUserId);

            if (customer == null)
            {
                // Create new customer
                customer = new Customer
                {
                    AuthUserId = authUserId,
                    Email = email,
                    Name = name,
                    Phone = phone,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Customers.Add(customer);
                _logger.LogInformation("Creating new customer for AuthUserId {AuthUserId}", authUserId);
            }
            else
            {
                // Update existing customer
                customer.Email = email;
                customer.Name = name;
                customer.Phone = phone ?? customer.Phone;
                customer.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation("Updating existing customer for AuthUserId {AuthUserId}", authUserId);
            }

            await _context.SaveChangesAsync();
            return customer;
        }
    }
}
