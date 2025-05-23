﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Models
{
    public class TrafficViolation
    {
        public int	ViolationId { get; set; }
        public string? SectionOfAct { get; set; }
        public string? ViolationType {get; set; }
        public string? Provision { get; set; }
        public decimal FineAmount { get; set; }
        public int Points { get; set; }
        public int DueDays { get; set; }

        public virtual ICollection<Fine>? Fines { get; set; }

    }
}
