using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Models
{
    public class RealTimeTracking
    {
        public int TrackingId { get; set; }

        public int OfficerId { get; set; }
        public virtual User? Officer { get; set; }

        public string? Latitude { get; set; }
        public string? Longitude { get; set; }
        public DateTime Timestamp { get; set; }

       

    }
}
