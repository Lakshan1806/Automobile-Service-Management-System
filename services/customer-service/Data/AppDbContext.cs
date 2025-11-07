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
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Customer entity
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasIndex(e => e.AuthUserId)
                    .IsUnique()
                    .HasDatabaseName("IX_Customers_AuthUserId");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Vehicle entity with camelCase column names
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.Property(e => e.CustomerName).HasColumnName("customerName");
                entity.Property(e => e.NoPlate).HasColumnName("noPlate");
                entity.Property(e => e.VehicleModel).HasColumnName("vehicleModel");
                entity.Property(e => e.VehicleBrand).HasColumnName("vehicleBrand");
                entity.Property(e => e.VehicleType).HasColumnName("vehicleType");
                entity.Property(e => e.VehicleModelYear).HasColumnName("vehicleModelYear");
                entity.Property(e => e.VehicleRegistrationYear).HasColumnName("vehicleRegistrationYear");
                entity.Property(e => e.ChaseNo).HasColumnName("chaseNo");
                entity.Property(e => e.Millage).HasColumnName("millage");
                entity.Property(e => e.LastServiceDate).HasColumnName("lastServiceDate");
                entity.Property(e => e.CreatedAt).HasColumnName("createdAt");
                entity.Property(e => e.CustomerIdFk).HasColumnName("customerIdFk");
                entity.Property(e => e.VehicleId).HasColumnName("vehicleId");

                entity.HasOne(v => v.Customer)
                    .WithMany(c => c.Vehicles)
                    .HasForeignKey(v => v.CustomerIdFk)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.VehicleId)
                    .IsUnique()
                    .HasDatabaseName("IX_Vehicles_VehicleId");
            });
        }
    }
}
