using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class VehicleRegistrationResponseDto
    {
        public int VehicleId { get; set; }
        public string? VehicleNumber { get; set; }
        public string? VehicleCategory { get; set; }
        public string? NicNumber { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
        public DateTime Year { get; set; }
        public string? Color { get; set; }
        public string? RegistrationNo { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public bool IsRoadTaxPaid { get; set; }
        public bool IsInsuranced { get; set; }
    }
}
