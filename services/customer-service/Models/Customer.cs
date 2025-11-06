using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentApi.Models
{
    /// <summary>
    /// Customer entity aligned with Auth service user IDs.
    /// AuthUserId is the primary identifier used across services.
    /// </summary>
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// The user ID from the authentication service (Spring Boot).
        /// This is the authoritative customer identifier for cross-service communication.
        /// </summary>
        [Required]
        public long AuthUserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
