﻿using backend.Models;
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
        Task<List<Station>> GetAllStationsAsync();
        Task<Station?> GetStationByCode(string stationCode);
        Task<bool> UpdateStationAsync(Station station);
        Task<bool> DeleteStationAsync(Station station);
    }
}
