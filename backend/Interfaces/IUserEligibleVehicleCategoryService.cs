using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IUserEligibleVehicleCategoryService
    {
        Task<bool> AddUserEligibleVehicleCategoryAsync(int userId, int vehicleCategoryId);
    }
}
