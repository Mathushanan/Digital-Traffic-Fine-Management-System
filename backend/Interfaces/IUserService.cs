using backend.Data;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IUserService
    {
        Task AddUserAsync(User user);
        Task<User?> GetUserByParameters(string email, string nicNumber, string licenseNumber, int badgeNumber);
        Task<User?> GetUserByEmail(string email);
        Task<User?> GetStationAdminByBadgeNumber(int badgeNumber);
        Task<User?> UpdateStationAdminRegisteredStaionId(int userId, int stationId);
        
    }
}
