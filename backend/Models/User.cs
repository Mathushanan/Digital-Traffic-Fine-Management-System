using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string? UserType { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? NicNumber { get; set; }
        public string? Address { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? ContactNumber { get; set; }
        public string? LicenseNumber { get; set; }
        public DateTime? LicenseIssueDate { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public int AvailablePoints { get; set; }

        public int RegisteredStationId { get; set; }
        public Station? RegisteredStation { get; set; }

        public virtual ICollection<User_VehicleCategory>? User_VehicleCategories { get; set; }
        public virtual ICollection<Fine>? Fines { get; set; }
        public virtual ICollection<RealTimeTracking>? RealTimeTrackings { get; set; }
        public virtual ICollection<Notification>? Notifications { get; set; }
        public virtual ICollection<Audit>? Audits { get; set; }

    }
}
