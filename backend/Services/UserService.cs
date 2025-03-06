using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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




    }
}
