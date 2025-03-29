using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Data
{
    public class SystemDbContext : DbContext
    {
        public SystemDbContext(DbContextOptions<SystemDbContext> options) : base(options)
        {

        }

        public DbSet<Audit> Audits { get; set; }
        public DbSet<Court> Courts { get; set; }
        public DbSet<Dispute> Disputes { get; set; }
        public DbSet<EligibleVehicleCategory> EligibleVehicleCategories { get; set; }
        public DbSet<Fine> Fines { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<RealTimeTracking> RealTimeTrackings { get; set; }
        public DbSet<Station> Stations { get; set; }
        public DbSet<TrafficViolation> TrafficViolations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<User_EligibleVehicleCategory> User_EligibleVehicleCategories { get; set; }
        public DbSet<VehicleRegistration> VehicleRegistrations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Audit>(entity =>
            {
                entity.HasKey(a => a.AuditId);

                entity.Property(a => a.ApiEndPoint)
                    .HasMaxLength(500)
                    .IsRequired(true);

                entity.Property(a => a.RequestType)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(a => a.TimeStamp)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(a => a.IpAddress)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(a => a.RequestHeader)
                    .HasColumnType("TEXT")
                    .IsRequired(true);

                entity.Property(a => a.RequestBody)
                    .HasColumnType("TEXT")
                    .IsRequired(false);

                entity.Property(a => a.QueryParams)
                    .HasColumnType("TEXT")
                    .IsRequired(false);

                entity.Property(a => a.UserAgent)
                    .HasMaxLength(255)
                    .IsRequired(true);

                //Users:Audits 1:M
                entity.HasOne(a => a.User)
                    .WithMany(u => u.Audits)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Court>(entity =>
            {
                entity.HasKey(c => c.CourtId);

                entity.Property(c => c.CourtName)
                    .HasMaxLength(255)
                    .IsRequired(true);

                entity.Property(c => c.CourtType)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(c => c.Location)
                    .HasMaxLength(500)
                    .IsRequired(false);

                entity.Property(c => c.Jurisdiction)
                    .HasMaxLength(200)
                    .IsRequired(true);

                entity.Property(c => c.ContactNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(c => c.EstablishedDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                //Courts:Fines 1:M
                entity.HasMany(c => c.Fines)
                    .WithOne(f => f.Court)
                    .HasForeignKey(f => f.CourtId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Dispute>(entity =>
            {
                entity.HasKey(d => d.DisputeId);

                entity.Property(d => d.DisputeReason)
                    .HasMaxLength(1000)
                    .IsRequired(true);

                entity.Property(d => d.SubmissionDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(d => d.Status)
                    .HasMaxLength(50)
                    .IsRequired(true);

                //Fines:Disputes 1:1
                entity.HasOne(d => d.Fine)
                    .WithOne(f => f.Dispute)
                    .HasForeignKey<Dispute>(d => d.FineId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<EligibleVehicleCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryId);

                entity.Property(e => e.CategoryName)
                    .HasMaxLength(200)
                    .IsRequired(true);

                entity.Property(e => e.Description)
                    .HasMaxLength(500)
                    .IsRequired(true);

                //EligibleVehicleCategories:User_EligibleVehicleCategories 1:M
                entity.HasMany(e => e.User_EligibleVehicleCategories)
                    .WithOne(u => u.EligibleVehicleCategory)
                    .HasForeignKey(u => u.EligibleVehicleCategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Fine>(entity =>
            {
                entity.HasKey(f => f.FineId);

                //Users(offender):Fines 1:M
                entity.HasOne(f => f.Offender)
                    .WithMany(u => u.OffenderFines)
                    .HasForeignKey(f => f.OffenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Users(issuer):Fines 1:M
                entity.HasOne(f => f.Issuer)
                    .WithMany(u => u.IssuerFines)
                    .HasForeignKey(f => f.IssuerId)
                    .OnDelete(DeleteBehavior.Restrict);

                //VehicleRegistrations:Fines 1:M
                entity.HasOne(f => f.Vehicle)
                    .WithMany(v => v.Fines)
                    .HasForeignKey(f => f.VehicleId)
                    .OnDelete(DeleteBehavior.Restrict);

                //TrafficViolations:Fines 1:M
                entity.HasOne(f => f.Violation)
                    .WithMany(v => v.Fines)
                    .HasForeignKey(f => f.ViolationId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Stations:Fines 1:M
                entity.HasOne(f => f.Station)
                    .WithMany(s => s.Fines)
                    .HasForeignKey(f => f.StationId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Courts:Fines 1:M
                entity.HasOne(f => f.Court)
                    .WithMany(c => c.Fines)
                    .HasForeignKey(f => f.CourtId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Disputes:Fines 1:1
                entity.HasOne(f => f.Dispute)
                    .WithOne(d => d.Fine)
                    .HasForeignKey<Dispute>(d => d.FineId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Payments:Fines 1:1
                entity.HasOne(f => f.Payment)
                    .WithOne(p => p.Fine)
                    .HasForeignKey<Payment>(p => p.FineId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(f => f.ViolationDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(f => f.DueDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(f => f.District)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(f => f.Longitude)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(f => f.Latitude)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(f => f.Status)
                    .HasMaxLength(50)
                    .IsRequired(true);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(n => n.NotificationId);

                entity.Property(n => n.NotifiedBy)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(n => n.ReceiverType)
                    .HasMaxLength(1000)
                    .IsRequired(true);

                entity.Property(n => n.Message)
                    .HasMaxLength(1000)
                    .IsRequired(true);

                entity.Property(n => n.SentAt)
                    .HasColumnType("datetime")
                    .IsRequired(true);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(p => p.PaymentId);

                //Fines:Payments 1:1
                entity.HasOne(p => p.Fine)
                    .WithOne(f => f.Payment)
                    .HasForeignKey<Payment>(p => p.FineId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(t => t.Amount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired(true);

                entity.Property(p => p.PaymentDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(p => p.PaymentMethod)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(p => p.TransactionId)
                    .HasMaxLength(100)
                    .IsRequired(true);
            });

            modelBuilder.Entity<RealTimeTracking>(entity =>
            {
                entity.HasKey(r => r.TrackingId);

                //Users(officer):RealTimeTrackings 1:M
                entity.HasOne(rt => rt.Officer)
                    .WithMany(u => u.RealTimeTrackings)
                    .HasForeignKey(rt => rt.OfficerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(rt => rt.Latitude)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(rt => rt.Longitude)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(rt => rt.Timestamp)
                    .HasColumnType("datetime")
                    .IsRequired(true);
            });

            modelBuilder.Entity<Station>(entity =>
            {
                entity.HasKey(s => s.StationId);

                entity.Property(s => s.StationCode)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(s => s.StationName)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(s => s.Address)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(s => s.District)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(s => s.ContactNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(s => s.Email)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(s => s.StationAdminId)
                    .IsRequired(false);

                //Stations:Users 1:M
                entity.HasMany(s => s.Users)
                    .WithOne(u => u.RegisteredStation)
                    .HasForeignKey(u => u.RegisteredStationId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Stations:Fines 1:M
                entity.HasMany(s => s.Fines)
                    .WithOne(f => f.Station)
                    .HasForeignKey(f => f.StationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TrafficViolation>(entity =>
            {
                entity.HasKey(t => t.ViolationId);

                entity.Property(t => t.SectionOfAct)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(t => t.ViolationType)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(t => t.Provision)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(t => t.FineAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired(true);

                entity.Property(t => t.Points)
                    .IsRequired(true);

                entity.Property(t => t.DueDays)
                    .IsRequired(true);

                //TrafficViolations:Fines 1:M
                entity.HasMany(t => t.Fines)
                    .WithOne(f => f.Violation)
                    .HasForeignKey(f => f.ViolationId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);

                entity.Property(u => u.UserType)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(u => u.FirstName)
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(u => u.LastName)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(u => u.Gender)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(u => u.DateOfBirth)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(u => u.Address)
                    .HasMaxLength(250)
                    .IsRequired(true);

                entity.Property(u => u.Email)
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(u => u.ContactNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(u => u.PasswordHash)
                    .HasMaxLength(200)
                    .IsRequired(true);

                entity.Property(u => u.NicNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(u => u.LicenseNumber)
                    .HasMaxLength(50)
                    .IsRequired(false);

                entity.Property(u => u.LicenseIssueDate)
                    .HasColumnType("datetime")
                    .IsRequired(false);

                entity.Property(u => u.LicenseExpiryDate)
                    .HasColumnType("datetime")
                    .IsRequired(false);

                entity.Property(u => u.AvailablePoints)
                    .IsRequired(false);

                entity.Property(u => u.BadgeNumber)
                    .HasMaxLength(100)
                    .IsRequired(true);

                //Stations:Users 1:M
                entity.HasOne(u => u.RegisteredStation)
                    .WithMany(s => s.Users)
                    .HasForeignKey(u => u.RegisteredStationId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Users:User_EligibleVehicleCategories 1:M
                entity.HasMany(u => u.User_EligibleVehicleCategories)
                    .WithOne(uc => uc.User)
                    .HasForeignKey(uc => uc.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                //Users(offender):Fines 1:M
                entity.HasMany(u => u.OffenderFines)
                    .WithOne(f => f.Offender)
                    .HasForeignKey(f => f.OffenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Users(issuer):Fines 1:M
                entity.HasMany(u => u.IssuerFines)
                    .WithOne(f => f.Issuer)
                    .HasForeignKey(f => f.IssuerId)
                    .OnDelete(DeleteBehavior.Restrict);

                //Users(officer):RealTimeTrackings 1:M
                entity.HasMany(u => u.RealTimeTrackings)
                    .WithOne(rt => rt.Officer)
                    .HasForeignKey(rt => rt.OfficerId)
                    .OnDelete(DeleteBehavior.Cascade);

                //Users:Audits 1:M
                entity.HasMany(u => u.Audits)
                    .WithOne(a => a.User)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<User_EligibleVehicleCategory>(entity =>
            {
                entity.HasKey(ue => new { ue.UserId, ue.EligibleVehicleCategoryId });

                //Users:User_EligibleVehicleCategories 1:M
                entity.HasOne(ue => ue.User)
                    .WithMany(u => u.User_EligibleVehicleCategories)
                    .HasForeignKey(ue => ue.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                //EligibleVehicleCategories:User_EligibleVehicleCategories 1:M  
                entity.HasOne(ue => ue.EligibleVehicleCategory)
                    .WithMany(ev => ev.User_EligibleVehicleCategories)
                    .HasForeignKey(ue => ue.EligibleVehicleCategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleRegistration>(entity =>
            {
                entity.HasKey(v => v.VehicleId);

                entity.Property(v => v.VehicleNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(v => v.NicNumber)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(v => v.Make)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(v => v.Model)
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(v => v.Year)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(v => v.Color)
                    .HasMaxLength(30)
                    .IsRequired(true);

                entity.Property(v => v.RegistrationNo)
                    .HasMaxLength(20)
                    .IsRequired(true);

                entity.Property(v => v.RegistrationDate)
                    .HasColumnType("datetime")
                    .IsRequired(true);

                entity.Property(v => v.IsRoadTaxPaid)
                    .IsRequired(true);

                entity.Property(v => v.IsInsuranced)
                    .IsRequired(true);

                //VehicleRegistrations:Fines 1:M
                entity.HasMany(v => v.Fines)
                    .WithOne(f => f.Vehicle)
                    .HasForeignKey(f => f.VehicleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
