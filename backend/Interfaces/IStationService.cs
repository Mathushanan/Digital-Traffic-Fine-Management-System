using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IStationService
    {
        Task<Station?> GetStationByParametersAsync(string stationCode, string stationName, string contactNumber, string email);
        Task<int> AddStationAsync(Station station);
        Task<List<Station>> GetAllStationsAsync();
        Task<Station?> GetStationByCodeAsync(string stationCode);
        Task<bool> UpdateStationAsync(Station station);
        Task<bool> DeleteStationAsync(Station station);

        Task<Station?> GetStationByStationAdminIdAsync(int stationAdminId);
        Task<Station?> UpdateStationAdminIdAsync(int stationId, int userId);
    }
}
