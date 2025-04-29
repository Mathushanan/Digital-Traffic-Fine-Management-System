using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Dtos
{
    public class StatisticsResponseDto
    {
        public int TotalRegisteredStations { get; set; }
        public int TotalRegisteredTrafficViolations { get; set; }
        public int TotalRegisteredStationAdmins { get; set; }
        public int TotalRegisteredTrafficPoliceOfficers { get; set; }
        public int TotalRegisteredPublicUsers { get; set; }
        public decimal TotalRevenueGenarated { get; set; }
        public int TotalFinesIssued { get; set; }
        public int PendingFines { get; set; }
        public int PaidFines { get; set; }
        public int DisputedFines { get; set; }
    }
}
