using PaymentApi.Dtos;

namespace PaymentApi.Repositories
{
    /// <summary>
    /// Repository interface for customer-related operations
    /// </summary>
    public interface ICustomerRepository
    {
        Task<IEnumerable<VehicleSummaryDto>> GetVehiclesByAuthUserIdAsync(long authUserId);
        Task<AppointmentDetailsDto?> GetAppointmentDetailsAsync(string vehicleId);
        Task<Models.Customer?> GetCustomerByAuthUserIdAsync(long authUserId);
        Task<Models.Customer> UpsertCustomerAsync(long authUserId, string email, string name, string? phone = null);
    }
}
