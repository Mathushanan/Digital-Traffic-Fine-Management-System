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
    public class FineService: IFineService
    {
        private readonly SystemDbContext _systemDbContext;

        public FineService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;

        }

        public async Task<int> AddFineAsync(Fine fine)
        {
            await _systemDbContext.Fines.AddAsync(fine);
            await _systemDbContext.SaveChangesAsync();
            return fine.FineId;
        }


        public async Task<List<Fine>> GetFinesByTrafficPoliceUserIdAsync(int userId)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.IssuerId == userId)
                .ToListAsync();

        }
        public async Task<List<Fine>> GetFinesByUserIdAndStatusAsync(int userId, string status)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.OffenderId == userId &&
                               fine.Status == status)
                .ToListAsync();

        }

        public async Task<List<Fine>> GetFinesByPublicUserIdAsync(int userId)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.OffenderId == userId)
                .ToListAsync();

        }
        public async Task<Fine?> GetFineByFineIdAsync(int fineId)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.FineId == fineId)
                .FirstOrDefaultAsync(); 
        }

        public async Task<bool> UpdateFineStatusAsync(int fineId,string status)
        {
            var fine = await _systemDbContext.Fines.FindAsync(fineId);
            if (fine == null)
            {
                return false;
            }
            fine.Status = status;
            await _systemDbContext.SaveChangesAsync();
            return true;

        }
        public async Task<List<Fine>> GetAllFinesByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.StationId == stationId)
                .ToListAsync();

        }
        public async Task<List<Fine>> GetFinesByStationIdAndStatusAsync(int stationId, string status)
        {
            return await _systemDbContext.Fines
                .Where(fine => fine.StationId == stationId &&
                               fine.Status == status)
                .ToListAsync();

        }





    }
}
