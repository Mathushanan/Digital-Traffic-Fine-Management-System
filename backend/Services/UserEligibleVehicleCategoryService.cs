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
    public class UserEligibleVehicleCategoryService:IUserEligibleVehicleCategoryService
    {
        private readonly SystemDbContext _systemDbContext;
        public UserEligibleVehicleCategoryService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }
        public async Task<bool> AddUserEligibleVehicleCategoryAsync(int userId, int vehicleCategoryId)
        {
            var entity = new User_EligibleVehicleCategory
            {
                UserId = userId,
                EligibleVehicleCategoryId = vehicleCategoryId
            };

            _systemDbContext.User_EligibleVehicleCategories.Add(entity);
            await _systemDbContext.SaveChangesAsync();
            return true;
        }

    }
}
