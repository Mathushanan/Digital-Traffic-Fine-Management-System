using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class NotificationRequestDto
    {
        public int NotificationId { get; set; }
        public string? MessageSender { get; set; }
        public string? MessageReceiverType { get; set; }
        public string? MessageContent { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
