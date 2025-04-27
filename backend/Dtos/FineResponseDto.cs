using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class FineResponseDto
    {
        public int FineId { get; set; }
        public int OffenderId { get; set; }
        public int IssuerId { get; set; }
        public int VehicleId { get; set; }
        public int ViolationId { get; set; }
        public int StationId { get; set; }
        public int CourtId { get; set; }
        public DateTime? ViolationDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? District { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }
        public string? Status { get; set; }

    }
}
