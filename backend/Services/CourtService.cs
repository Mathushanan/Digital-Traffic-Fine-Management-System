using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CourtService : ICourtService
    {
        private readonly SystemDbContext _systemDbContext;
        public CourtService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }
        public async Task<List<Court>> GetAllCourtsAsync()
        {

            return await _systemDbContext.Courts.ToListAsync();
        }
    }
}
