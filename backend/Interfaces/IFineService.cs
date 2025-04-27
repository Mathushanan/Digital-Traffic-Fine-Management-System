using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IFineService
    {
        Task<int> AddFineAsync(Fine fine);
        Task<List<Fine>> GetFinesByUserIdAndStatusAsync(int userId, string status);
        Task<List<Fine>> GetFinesByTrafficPoliceUserIdAsync(int userId);
        Task<List<Fine>> GetFinesByPublicUserIdAsync(int userId);

    }
}
