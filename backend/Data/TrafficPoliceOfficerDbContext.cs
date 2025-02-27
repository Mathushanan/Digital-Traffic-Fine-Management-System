using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Data
{
    public class TrafficPoliceOfficerDbContext : DbContext
    {
        public TrafficPoliceOfficerDbContext(DbContextOptions<TrafficPoliceOfficerDbContext> options) : base(options)
        {

        }
        public DbSet<TrafficPoliceOfficer> TrafficPoliceOfficers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TrafficPoliceOfficer>(entity =>
            {
                entity.HasKey(e => e.OfficerId);

                entity.Property(e => e.BadgeNumber)
                    .IsRequired(true);

                entity.Property(e => e.NicNumber)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(e => e.LicenseNumber)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(e => e.LastName)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(e => e.DateOfBirth)
                    .IsRequired(true);

                entity.Property(e => e.Gender)
                    .HasMaxLength(10)
                    .IsRequired(true);

                entity.Property(e => e.ContactNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(e => e.Email)
                    .HasMaxLength(150)
                    .IsRequired(true);

                entity.Property(e => e.Address)
                    .HasMaxLength(255)
                    .IsRequired(true);

                entity.Property(e => e.HiredDate)
                    .IsRequired(true);

                entity.Property(e => e.IsActive)
                    .IsRequired(true);

                entity.Property(e => e.StationCode)
                    .HasMaxLength(50)
                    .IsRequired(true);

            });
        }


    }
}
