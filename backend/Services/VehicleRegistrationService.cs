using backend.Data;
using backend.Interfaces;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace backend.Services
{
    public class VehicleRegistrationService:IVehicleRegistrationService
    {
        private readonly SystemDbContext _systemDbContext;

        public VehicleRegistrationService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;

        }
        public async Task<VehicleRegistration?> GetVehicleByVehicleNumberAsync(string vehicleNumber)
        {
            return await _systemDbContext.VehicleRegistrations
               .Where(vehicleRegistration =>

                              vehicleRegistration.VehicleNumber == vehicleNumber)
               .FirstOrDefaultAsync();
        }
    }
}
