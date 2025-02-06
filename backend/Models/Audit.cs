using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class Audit
    {
        public int AuditId { get; set; }

        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public string? ApiEndPoint { get; set; }
        public string? RequestType { get; set; }
        public DateTime? TimeStamp { get; set; }
        public string? IpAddress { get; set; }
        public string? RequestHeader { get; set; }
        public string? RequestBody { get; set; }
        public string? QueryParams { get; set; }
        public string? UserAgent { get; set; }

    }
}
