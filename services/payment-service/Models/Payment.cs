using System;
using System.ComponentModel.DataAnnotations;

namespace PaymentApi.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string OrderId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Status { get; set; } = "Pending";

        [Required]
        public string ItemName { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public string Currency { get; set; } = "LKR";

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required]
        [MaxLength(100)]
        public string Address { get; set; }

        [Required]
        [MaxLength(50)]
        public string City { get; set; }

        [Required]
        public string Country { get; set; } = "Sri Lanka";

        public string GatewayTransactionId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
