using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Models
{
    public class Payment
    {
        public int	PaymentId { get; set; }

        public int FineId { get; set; }
        public virtual Fine? Fine { get; set; }

        public DateTime? PaymentDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }

    }
}
