using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;


namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly SystemDbContext _systemDbContext;

        public UserService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }

        public async Task<int> AddUserAsync(User user)
        {
            await _systemDbContext.Users.AddAsync(user);
            await _systemDbContext.SaveChangesAsync();

            return user.UserId; // Assuming 'Id' is an integer
        }



        public async Task<User?> GetUserByParametersAsync(string email, string nicNumber, string licenseNumber, int badgeNumber)
        {
            return await _systemDbContext.Users
                .Where(user => user.Email == email ||
                               user.NicNumber == nicNumber ||
                               user.LicenseNumber == licenseNumber ||
                               user.BadgeNumber == badgeNumber)
                .FirstOrDefaultAsync();

        }
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _systemDbContext.Users
                .Where(user => user.Email == email)
                .FirstOrDefaultAsync();

        }
        public async Task<User?> GetStationAdminByBadgeNumberAsync(int badgeNumber)
        {
            return await _systemDbContext.Users
                .Where(user => user.BadgeNumber == badgeNumber)
                .FirstOrDefaultAsync();

        }
        public async Task<User?> UpdateStationAdminRegisteredStaionIdAsync(int userId, int stationId)
        {
            var user = await _systemDbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }
            user.RegisteredStationId = stationId;
            await _systemDbContext.SaveChangesAsync();

            return user;

        }

        public async Task<bool> DeleteUserByUserIdAsync(int userId)
        {
           
                var user = await _systemDbContext.Users.FindAsync(userId);

                if (user == null)
                {
                    return false;
                }

                _systemDbContext.Users.Remove(user);
                await _systemDbContext.SaveChangesAsync();

                return true;
            
           
        }
        public async Task<bool> SetRegisteredStationIdToNull(int stationAdminId)
        {
            var user = await _systemDbContext.Users.FindAsync(stationAdminId);
            if (user == null)
            {
                return false;
            }
            user.RegisteredStationId = null;
            await _systemDbContext.SaveChangesAsync();
            return true;

        }
        public async Task<List<User>> GetAllStationAdminsAsync()
        {
            return await _systemDbContext.Users
                .Where(user => user.UserType == "StationAdmin")
                .ToListAsync();
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _systemDbContext.Users.FindAsync(userId);

            if (user == null)
            {
                return false;
            }

            _systemDbContext.Users.Remove(user);
            return await _systemDbContext.SaveChangesAsync() > 0;
        }
        public async Task<User?> GetUserByUserIdAsync(int userId)
        {
            return await _systemDbContext.Users
                .Where(user => user.UserId == userId)
                .FirstOrDefaultAsync();

        }
        public async Task<bool> UpdateUserAsync(User user)
        {
            _systemDbContext.Users.Update(user);
            return await _systemDbContext.SaveChangesAsync() > 0;
        }

        public async Task<List<User>> GetAllTrafficPoliceAsync(int registeredStationId)
        {
            return await _systemDbContext.Users
                .Where(user => user.UserType == "TrafficPolice" && user.RegisteredStationId==registeredStationId)
                .ToListAsync();
        }

        public async Task<User?> GetPublicUserByParametersAsync(string email, string nicNumber, string licenseNumber)
        {
            return await _systemDbContext.Users
                .Where(user => user.Email == email ||
                               user.NicNumber == nicNumber ||
                               user.LicenseNumber == licenseNumber)
                .FirstOrDefaultAsync();

        }

        public async Task<List<User>> GetAllPublicUsersAsync(int registeredStationId)
        {
            return await _systemDbContext.Users
                .Where(user => user.UserType == "PublicUser" && user.RegisteredStationId==registeredStationId)
                .ToListAsync();
        }


        public async Task<User?> GetPublicUserByNicLicenseNumberAsync(string nicNumber, string licenseNumber)
        {
            return await _systemDbContext.Users
               .Where(user => 
                              user.NicNumber == nicNumber ||
                              user.LicenseNumber == licenseNumber)
               .FirstOrDefaultAsync();
        }

        public async Task<User?> GetPublicUserByLicenseNumberAsync(string licenseNumber)
        {
            return await _systemDbContext.Users
               .Where(user =>
                             
                              user.LicenseNumber == licenseNumber)
               .FirstOrDefaultAsync();
        }

        public async Task<string> GetEligibleVehicleCategories(int userId)
        {
            var categories = _systemDbContext.User_EligibleVehicleCategories
                .Where(uevc => uevc.UserId == userId)
                .Select(uevc => uevc.EligibleVehicleCategory!.CategoryName)
                .Where(name => name != null)
                .ToList();

            return string.Join(", ", categories);
        }

        public async Task<User?> GetUserByLicenseNumberAsync( string licenseNumber)
        {
            return await _systemDbContext.Users
               .Where(user => user.LicenseNumber == licenseNumber)
               .FirstOrDefaultAsync();
        }

        public async Task<bool> DeductPointsAsync(int offenderId, int points)
        {
            var user = await _systemDbContext.Users.FindAsync(offenderId);
            if (user == null)
            {
                return false;
            }
            user.AvailablePoints = user.AvailablePoints - points;
            await _systemDbContext.SaveChangesAsync();

            return true;

        }



    }
}
