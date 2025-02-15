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

        public async Task AddUserAsync(User user)
        {
            await _systemDbContext.Users.AddAsync(user);
            await _systemDbContext.SaveChangesAsync();
        }

        public async Task<User?> GetUserByParameters(string email, string nicNumber, string licenseNumber, int badgeNumber)
        {
            return await _systemDbContext.Users
                .Where(user => user.Email == email ||
                               user.NicNumber == nicNumber ||
                               user.LicenseNumber == licenseNumber ||
                               user.BadgeNumber == badgeNumber)
                .FirstOrDefaultAsync();

        }
        public async Task<User?> GetUserByEmail(string email)
        {
            return await _systemDbContext.Users
                .Where(user => user.Email == email)
                .FirstOrDefaultAsync();

        }
    }
}
