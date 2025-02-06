using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class Dispute
    {
        public int DisputeId { get; set; }

        public int FineId { get; set; }
        public virtual Fine? Fine { get; set; }

        public string? DisputeReason { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public string? Status { get; set; }

    }
}
