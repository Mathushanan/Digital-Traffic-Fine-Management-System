using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class VehicleRegistration
    {
        public int VehicleId { get; set; }
        public string? VehicleNumber { get; set; }
        public string? NicNumber { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
        public DateTime? Year { get; set; }
        public string? Color { get; set; }
        public string? RegistrationNo { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public bool IsRoadTaxPaid { get; set; }
        public bool IsInsuranced { get; set; }

        public virtual ICollection<Fine>? Fines { get; set; }

    }
}
