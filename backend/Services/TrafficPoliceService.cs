using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;


namespace backend.Services
{
    public class TrafficPoliceService:ITrafficPoliceService
    {
        private readonly TrafficPoliceOfficerDbContext _trafficPoliceOfficerDbContext;

        public TrafficPoliceService(TrafficPoliceOfficerDbContext trafficPoliceOfficerDbContext)
        {
            this._trafficPoliceOfficerDbContext = trafficPoliceOfficerDbContext; 
        }
        public async Task<TrafficPoliceOfficer?> GetTrafficPoliceByNicBadgeNumberAsync(string nicNumber, int badgeNumber)
        {
            return await _trafficPoliceOfficerDbContext.TrafficPoliceOfficers
                .Where(trafficPoliceOfficer =>
                               trafficPoliceOfficer.NicNumber == nicNumber &&
                               trafficPoliceOfficer.BadgeNumber == badgeNumber)
                .FirstOrDefaultAsync();

        }
    }
}
