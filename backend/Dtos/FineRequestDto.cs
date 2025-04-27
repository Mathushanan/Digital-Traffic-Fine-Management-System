using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class FineRequestDto
    {
        public string? IssuerEmail { get; set; }
        public string? LicenseNumber { get; set; }
        public string? VehicleNumber { get; set; }
        public int StationId { get; set; }
        public int CourtId { get; set; }
        public DateTime ViolationDate { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }
        public string? Status { get; set; }
        public List<AssignedFineDto>? AssignedFines { get; set; }
    }
}
