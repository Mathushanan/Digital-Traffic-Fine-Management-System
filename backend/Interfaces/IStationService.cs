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
        Task<Station?> GetStationByParameters(string stationCode, string stationName, string contactNumber, string email,int userId);
        Task<int> AddStationAsync(Station station);
    }
}
