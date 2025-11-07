using System.Text.Json.Serialization;

namespace PaymentApi.Dtos
{
    /// <summary>
    /// DTO for vehicle response with basic customer info (no cycles)
    /// </summary>
    public class VehicleDto
    {
        [JsonPropertyName("vehicleId")]
        public string VehicleId { get; set; } = string.Empty;

        [JsonPropertyName("noPlate")]
        public string NoPlate { get; set; } = string.Empty;

        [JsonPropertyName("vehicleModel")]
        public string VehicleModel { get; set; } = string.Empty;

        [JsonPropertyName("vehicleBrand")]
        public string VehicleBrand { get; set; } = string.Empty;

        [JsonPropertyName("vehicleType")]
        public string? VehicleType { get; set; }

        [JsonPropertyName("vehicleModelYear")]
        public int? VehicleModelYear { get; set; }

        [JsonPropertyName("vehicleRegistrationYear")]
        public int? VehicleRegistrationYear { get; set; }

        [JsonPropertyName("chaseNo")]
        public string? ChaseNo { get; set; }

        [JsonPropertyName("millage")]
        public int Millage { get; set; }

        [JsonPropertyName("lastServiceDate")]
        public DateTime? LastServiceDate { get; set; }
        
        // Basic customer info (no navigation properties to avoid cycles)
        [JsonPropertyName("customerId")]
        public long CustomerId { get; set; }

        [JsonPropertyName("customerName")]
        public string CustomerName { get; set; } = string.Empty;

        [JsonPropertyName("customerEmail")]
        public string CustomerEmail { get; set; } = string.Empty;

        [JsonPropertyName("customerPhone")]
        public string? CustomerPhone { get; set; }
    }
}
