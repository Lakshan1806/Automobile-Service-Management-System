using Microsoft.EntityFrameworkCore;
using PaymentApi.Models;

namespace PaymentApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Payment> Payments { get; set; }
    }
}
