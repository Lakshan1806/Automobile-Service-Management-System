using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PaymentApi.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string VehicleId { get; set; } = Guid.NewGuid().ToString();

        [MaxLength(200)]
        [JsonPropertyName("customerName")]
        public string? CustomerName { get; set; }

        [Required]
        [MaxLength(50)]
        [JsonPropertyName("noPlate")]
        public string NoPlate { get; set; }

        [Required]
        [MaxLength(100)]
        [JsonPropertyName("vehicleModel")]
        public string VehicleModel { get; set; }

        [Required]
        [MaxLength(50)]
        [JsonPropertyName("vehicleBrand")]
        public string VehicleBrand { get; set; }

        [MaxLength(50)]
        [JsonPropertyName("vehicleType")]
        public string? VehicleType { get; set; } = "Car";

        [JsonPropertyName("vehicleModelYear")]
        public int? VehicleModelYear { get; set; }

        [JsonPropertyName("vehicleRegistrationYear")]
        public int? VehicleRegistrationYear { get; set; }

        [MaxLength(100)]
        [JsonPropertyName("chaseNo")]
        public string? ChaseNo { get; set; }

        [JsonPropertyName("millage")]
        public int Millage { get; set; }

        [JsonPropertyName("lastServiceDate")]
        public DateTime? LastServiceDate { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [JsonPropertyName("customerIdFk")]
        public int CustomerIdFk { get; set; }

        [ForeignKey(nameof(CustomerIdFk))]
        public Customer Customer { get; set; }
    }
}
