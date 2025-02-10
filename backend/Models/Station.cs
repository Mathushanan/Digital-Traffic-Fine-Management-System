using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Station
    {
        public int StationId { get; set; }
        public string? StationCode { get; set; }
        public string? StationName { get; set; }
        public string? Longitude { get; set; }
        public string? Latitude { get; set; }
        public string? District { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public int? StationAdminId { get; set; }

        public virtual ICollection<User>? Users { get; set; }
        public virtual ICollection<Fine>? Fines { get; set; }

    }
}
