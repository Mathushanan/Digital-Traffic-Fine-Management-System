using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IFineService
    {
        Task<int> AddFineAsync(Fine fine);
        Task<List<Fine>> GetFinesByUserIdAndStatusAsync(int userId, string status);
        Task<List<Fine>> GetFinesByTrafficPoliceUserIdAsync(int userId);
        Task<List<Fine>> GetFinesByPublicUserIdAsync(int userId);
        Task<Fine?> GetFineByFineIdAsync(int fineId);
        Task<bool> UpdateFineStatusAsync(int fineId, string status);
        Task<List<Fine>> GetAllFinesByStationIdAsync(int stationId);
        Task<List<Fine>> GetFinesByStationIdAndStatusAsync(int stationId, string status);
        Task<int> GetTotalFinesAsync();
        Task<int> GetTotalPaidFinesAsync();
        Task<int> GetTotalPendingFinesAsync();
        Task<int> GetTotalDisputedFinesAsync();

        Task<int> GetTotalFinesByStationIdAsync(int stationId);
        Task<int> GetTotalPaidFinesByStationIdAsync(int stationId);
        Task<int> GetTotalPendingFinesByStationIdAsync(int stationId);
        Task<int> GetTotalDisputedFinesByStationIdAsync(int stationId);

        Task<int> GetTotalFinesByIssuerIdAsync(int issuerId);
        Task<int> GetTotalPaidFinesByIssuerIdAsync(int issuerId);
        Task<int> GetTotalPendingFinesByIssuerIdAsync(int issuerId);
        Task<int> GetTotalDisputedFinesByIssuerIdAsync(int issuerId);

        Task<int> GetTotalFinesByOffenderIdAsync(int offenderId);
        Task<int> GetTotalPaidFinesByOffenderIdAsync(int offenderId);
        Task<int> GetTotalPendingFinesByOffenderIdAsync(int offenderId);
        Task<int> GetTotalDisputedFinesByOffenderIdAsync(int offenderId);

        Task<List<Fine>> GetAllFinesAsync();
        Task<List<Fine>> GetAllFinesWithAllRelatedDataAsync();
    }
}
