using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IVehicleRegistrationService
    {
        Task<VehicleRegistration?> GetVehicleByVehicleNumberAsync(string vehicleNumber);
    }
}
