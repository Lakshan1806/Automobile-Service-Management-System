using System;
using System.ComponentModel.DataAnnotations;

namespace PaymentApi.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }

        // Unique identifier supplied by frontend or generated server-side
        [Required]
        public string VehicleId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(50)]
        public string VehicleNo { get; set; }

        [Required]
        [MaxLength(100)]
        public string VehicleModel { get; set; }

        [Required]
        [MaxLength(50)]
        public string Brand { get; set; }

        [Required]
        public string CustomerId { get; set; }

        public int Mileage { get; set; }

        public DateTime? LastServiceDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ Make nullable so migration doesn’t fail when empty
        [MaxLength(100)]
        public string? ChassisNo { get; set; }

        // ✅ Make nullable + limit length to avoid DB truncation
        [MaxLength(20)]
        public string? CustomerPhone { get; set; }
    }
}
