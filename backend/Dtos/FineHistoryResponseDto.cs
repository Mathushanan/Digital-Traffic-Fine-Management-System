using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class FineHistoryResponseDto
    {
        public int FineId { get; set; }
        public string? OffenderName { get; set; }
        public string? IssuerName { get; set; }
        public int? BadgeNumber { get; set; }
        public string? VehicleNumber { get; set; }

        public string? StationName { get; set; }
        public string? CourtName { get; set; }
        public DateTime? ViolationDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }
        public string? Status { get; set; }
        public string? SectionOfAct { get; set; }
        public string? Provision { get; set; }
        public int DeductedPoints { get; set; }
        public decimal? Amount { get; set; }
       

    }
}
