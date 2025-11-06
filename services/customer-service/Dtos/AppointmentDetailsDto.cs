using System;

namespace PaymentApi.Dtos
{
    /// <summary>
    /// DTO for combined appointment details (vehicle + owner info)
    /// </summary>
    public class AppointmentDetailsDto
    {
        public string vehicleId { get; set; }
        public string noPlate { get; set; }
        public string chaseNo { get; set; }
        public string vehicleType { get; set; }
        public string vehicleBrand { get; set; }
        public string customerId { get; set; }
        public string customerPhone { get; set; }
        public string customerName { get; set; }
        public int millage { get; set; }
        public string lastServiceDate { get; set; }
        public int? vehicleModelYear { get; set; }
        public int? vehicleRegistrationYear { get; set; }
    }
}
