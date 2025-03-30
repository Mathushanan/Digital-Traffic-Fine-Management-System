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
        Task<int> AddUserAsync(User user);
        Task<User?> GetUserByParametersAsync(string email, string nicNumber, string licenseNumber, int badgeNumber);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetStationAdminByBadgeNumberAsync(int badgeNumber);
        Task<User?> UpdateStationAdminRegisteredStaionIdAsync(int userId, int stationId);
        Task<bool> DeleteUserByUserIdAsync(int userId);
        Task<bool> SetRegisteredStationIdToNull(int stationAdminId);

        Task<List<User>> GetAllStationAdminsAsync();
        Task<bool> DeleteUserAsync(int userId);
        Task<User?> GetUserByUserIdAsync(int userId);
        Task<bool> UpdateUserAsync(User user);
        Task<List<User>> GetAllTrafficPoliceAsync();
        Task<User?> GetPublicUserByParametersAsync(string email, string nicNumber, string licenseNumber);
        Task<List<User>> GetAllPublicUsersAsync();




        }
}
