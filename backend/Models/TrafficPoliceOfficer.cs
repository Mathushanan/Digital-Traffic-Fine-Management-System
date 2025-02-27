using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class TrafficPoliceOfficer
    {
        public int OfficerId { get; set; }
        public int BadgeNumber { get; set; }
        public string? NicNumber { get; set; }
        public string? LicenseNumber { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime HiredDate { get; set; }
        public bool IsActive { get; set; }
        public string? StationCode { get; set; }

    }
}
