using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class StationRequestDto
    {

        public string? StationCode { get; set; }
        public string? StationName { get; set; }
        public string? Address { get; set; }
        public string? District { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public int? StationAdminBadgeNumber { get; set; }
    }
}
