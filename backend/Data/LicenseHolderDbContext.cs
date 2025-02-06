using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Data
{
    public class LicenseHolderDbContext : DbContext
    {
        public LicenseHolderDbContext(DbContextOptions<LicenseHolderDbContext> options):base(options)
        {
            
        }
        public DbSet<LicenseHolder> LicenseHolders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LicenseHolder>(entity =>
            {
                // Primary Key mapping
                entity.HasKey(e => e.HolderId);

                // Property mappings
                entity.Property(e => e.HolderId)
                    .IsRequired();

                entity.Property(e => e.FirstName)
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(e => e.LastName)
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(e => e.LicenseNumber)
                    .HasMaxLength(50)
                    .IsRequired(false);

                entity.Property(e => e.NicNumber)
                    .HasMaxLength(50)
                    .IsRequired(false);

                entity.Property(e => e.Gender)
                    .HasMaxLength(10)
                    .IsRequired(false);

                entity.Property(e => e.DateOfBirth)
                    .IsRequired(false);

                entity.Property(e => e.Address)
                    .HasMaxLength(255)
                    .IsRequired(false);

                entity.Property(e => e.ContactNumber)
                    .HasMaxLength(20)
                    .IsRequired(false);

                entity.Property(e => e.Email)
                    .HasMaxLength(150)
                    .IsRequired(false);

                entity.Property(e => e.IssueDate)
                    .IsRequired(false);

                entity.Property(e => e.ExpiryDate)
                    .IsRequired(false);

                entity.Property(e => e.PermittedVehicleCategories)
                    .HasMaxLength(255)
                    .IsRequired(false);


            });
        }
                

    }
}
