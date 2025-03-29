using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace backend.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public string? NotifiedBy { get; set; }

        public string? ReceiverType { get; set; }

        public string? Message { get; set; }
        public DateTime? SentAt { get; set; }

    }
}
