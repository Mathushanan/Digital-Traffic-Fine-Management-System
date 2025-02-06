using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class Court
    {
        public int CourtId { get; set; }
        public string? CourtName { get; set; }
        public string? CourtType { get; set; }
        public string? Location { get; set; }
        public string? Jurisdiction { get; set; }
        public string? ContactNumber { get; set; }
        public DateTime? EstablishedDate { get; set; }

        public virtual ICollection<Fine>? Fines { get; set; }

    }
}
