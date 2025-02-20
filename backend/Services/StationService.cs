using backend.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Models;
using backend.Data;
using System.Numerics;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class StationService : IStationService
    {

        private readonly SystemDbContext _systemDbContext;

        public StationService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }

        public async Task<Station?> GetStationByParameters(string stationCode, string stationName, string contactNumber, string email,int userId)
        {
            return await _systemDbContext.Stations
            .Where(station => station.StationCode == stationCode ||
                              station.StationName == stationName ||
                              station.ContactNumber == contactNumber ||
                              station.Email == email
                              || station.StationAdminId==userId)

            .FirstOrDefaultAsync();

        }
        public async Task<int> AddStationAsync(Station station)
        {
            await _systemDbContext.Stations.AddAsync(station);
            await _systemDbContext.SaveChangesAsync();
            return station.StationId;
        }
        public async Task<List<Station>> GetAllStationsAsync()
        {

            return await _systemDbContext.Stations.ToListAsync();
        }
    }
}
