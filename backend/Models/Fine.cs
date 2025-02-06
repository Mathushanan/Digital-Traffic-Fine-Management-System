using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class Fine
    {
        public int FineId { get; set; }
       
        public DateTime? ViolationDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? District { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }
        public string? Status { get; set; }

        public int OffenderId { get; set; }
        public virtual User? Offender { get; set; }

        public int IssuerId { get; set; }
        public virtual User? Issuer { get; set; }

        public int VehicleId { get; set; }
        public virtual Vehicle? Vehicle { get; set; }

        public int ViolationId { get; set; }
        public virtual TrafficViolation? Violation { get; set; }

        public int StationId { get; set; }
        public virtual Station? Station { get; set; }

        public int CourtId { get; set; }
        public virtual Court? Court { get; set; }

        public virtual ICollection<Dispute>? Disputes { get; set; }
        public virtual ICollection<Payment>? Payments { get; set; }






    }
}
