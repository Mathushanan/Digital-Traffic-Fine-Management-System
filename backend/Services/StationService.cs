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

        public async Task<Station?> GetStationByParametersAsync(string stationCode, string stationName, string contactNumber, string email)
        {
            return await _systemDbContext.Stations
            .Where(station => station.StationCode == stationCode ||
                              station.StationName == stationName ||
                              station.ContactNumber == contactNumber ||
                              station.Email == email
                              )

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
        public async Task<Station?> GetStationByCodeAsync(string stationCode)
        {
            if (string.IsNullOrWhiteSpace(stationCode))
            {
                return null; 
            }
            return await _systemDbContext.Stations
                .Where(station => station.StationCode == stationCode.Trim())
                .SingleOrDefaultAsync();
        }
        public async Task<bool> UpdateStationAsync(Station station)
        {
            _systemDbContext.Stations.Update(station);
            return await _systemDbContext.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteStationAsync(Station station)
        {
          
            if (station == null)
            {
                return false; 
            }
            _systemDbContext.Stations.Remove(station);
            return await _systemDbContext.SaveChangesAsync() > 0;
        }

        public async Task<Station?> GetStationByStationAdminIdAsync(int stationAdminId)
        {

            return await _systemDbContext.Stations
                .Where(station => station.StationAdminId == stationAdminId)
                .SingleOrDefaultAsync();
        }
        public async Task<Station?> UpdateStationAdminIdAsync(int stationId, int userId)
        {
            // Find the user by userId
            var station = await _systemDbContext.Stations.FindAsync(stationId);
            if (station == null)
            {
                return null;
            }
            if(userId == 0)
            {
                station.StationAdminId = null;
                await _systemDbContext.SaveChangesAsync();
                return station;
            }
            else
            {
                station.StationAdminId = userId;
                await _systemDbContext.SaveChangesAsync();
                return station;
            }
           

            

        }


    }
}
