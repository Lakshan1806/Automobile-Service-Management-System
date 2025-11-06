namespace PaymentApi.Dtos
{
    /// <summary>
    /// DTO for creating a new vehicle
    /// </summary>
    public class VehicleCreateDto
    {
        public string? VehicleId { get; set; }
        public string NoPlate { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string VehicleBrand { get; set; } = string.Empty;
        public string? VehicleType { get; set; }
        public int? VehicleModelYear { get; set; }
        public int? VehicleRegistrationYear { get; set; }
        public string? ChaseNo { get; set; }
        public int Millage { get; set; }
        public DateTime? LastServiceDate { get; set; }

        // Customer information for first-time users
        public long? AuthUserId { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
    }
}
