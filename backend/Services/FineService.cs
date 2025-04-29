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

        public async Task<int> GetTotalFinesAsync()
        {
            return await _systemDbContext.Fines.CountAsync();
        }
        public async Task<int> GetTotalPendingFinesAsync()
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "pending")
                .CountAsync();
        }
        public async Task<int> GetTotalPaidFinesAsync()
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "paid")
                .CountAsync();
        }
        public async Task<int> GetTotalDisputedFinesAsync()
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "disputed")
                .CountAsync();
        }



        public async Task<int> GetTotalFinesByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Fines.Where(u => u.StationId == stationId).CountAsync();
        }
        public async Task<int> GetTotalPendingFinesByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "pending" && u.StationId == stationId)
                .CountAsync();
        }
        public async Task<int> GetTotalPaidFinesByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "paid" && u.StationId == stationId)
                .CountAsync();
        }
        public async Task<int> GetTotalDisputedFinesByStationIdAsync(int stationId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "disputed" && u.StationId == stationId)
                .CountAsync();
        }





        public async Task<int> GetTotalFinesByIssuerIdAsync(int issuerId)
        {
            return await _systemDbContext.Fines.Where(u => u.IssuerId == issuerId).CountAsync();
        }
        public async Task<int> GetTotalPendingFinesByIssuerIdAsync(int issuerId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "pending" && u.IssuerId == issuerId)
                .CountAsync();
        }
        public async Task<int> GetTotalPaidFinesByIssuerIdAsync(int issuerId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "paid" && u.IssuerId == issuerId)
                .CountAsync();
        }
        public async Task<int> GetTotalDisputedFinesByIssuerIdAsync(int issuerId)
        {
            return await _systemDbContext.Fines
                .Where(u => u.Status == "disputed" && u.IssuerId == issuerId)
                .CountAsync();
        }





    }
}
