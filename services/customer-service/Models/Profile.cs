using System;
using System.ComponentModel.DataAnnotations;

namespace PaymentApi.Models
{
    public class Profile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string ProfileId { get; set; } = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(15)]
        public string Phone { get; set; }

        [MaxLength(200)]
        public string Address { get; set; }

        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
    }
}
