using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ITrafficViolationService
    {
        Task<int> AddTrafficViolationAsync(TrafficViolation trafficViolation);
        Task<TrafficViolation?> GetTrafficViolationByParametersAsync(string sectionOfAct, string provision);
        Task<List<TrafficViolation>> GetAllTrafficViolationsAsync();
        Task<bool> UpdateTrafficViolationAsync(TrafficViolation trafficviolation);
        Task<TrafficViolation?> GetTrafficViolationByViolationIdAsync(int violationId);
    }
}
