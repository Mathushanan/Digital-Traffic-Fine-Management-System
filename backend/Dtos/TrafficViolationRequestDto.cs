using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class TrafficViolationRequestDto
    {
        public int ViolationId { get; set; }
        public string? SectionOfAct { get; set; }
        public string? ViolationType { get; set; }
        public string? Provision { get; set; }
        public decimal FineAmount { get; set; }
        public int Points { get; set; }
        public int DueDays { get; set; }
    }
}
