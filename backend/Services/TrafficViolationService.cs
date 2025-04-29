using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TrafficViolationService:ITrafficViolationService
    {
        private readonly SystemDbContext _systemDbContext;
        public TrafficViolationService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }

        public async Task<TrafficViolation?> GetTrafficViolationByParametersAsync(string sectionOfAct, string provision)
        {
            return await _systemDbContext.TrafficViolations
            .Where(trafficViolation => trafficViolation.SectionOfAct == sectionOfAct ||
                              trafficViolation.Provision == provision
                              ).FirstOrDefaultAsync();

        }

        public async Task<int> AddTrafficViolationAsync(TrafficViolation trafficViolation)
        {
            await _systemDbContext.TrafficViolations.AddAsync(trafficViolation);
            await _systemDbContext.SaveChangesAsync();
            return trafficViolation.ViolationId;
        }

        public async Task<List<TrafficViolation>> GetAllTrafficViolationsAsync()
        {

            return await _systemDbContext.TrafficViolations.ToListAsync();
        }
        public async Task<TrafficViolation?> GetTrafficViolationByViolationIdAsync(int violationId)
        {
            return await _systemDbContext.TrafficViolations
                .Where(trafficViolation => trafficViolation.ViolationId == violationId)
                .FirstOrDefaultAsync();

        }
        public async Task<bool> UpdateTrafficViolationAsync(TrafficViolation trafficviolation)
        {
            _systemDbContext.TrafficViolations.Update(trafficviolation);
            return await _systemDbContext.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteTrafficViolationAsync(int violationId)
        {
            var trafficViolation = await _systemDbContext.TrafficViolations.FindAsync(violationId);

            if (trafficViolation == null)
            {
                return false;
            }

            _systemDbContext.TrafficViolations.Remove(trafficViolation);
            return await _systemDbContext.SaveChangesAsync() > 0;

        }
        public async Task<int> GetTotalTrafficViolationsAsync()
        {
            return await _systemDbContext.TrafficViolations.CountAsync();
        }

    }
}
