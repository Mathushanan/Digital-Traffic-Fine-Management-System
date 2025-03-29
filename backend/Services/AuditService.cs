using backend.Data;
using backend.Interfaces;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AuditService:IAuditService
    {
        private readonly SystemDbContext _systemDbContext;

        public AuditService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;

        }
        public async Task<int> LogAuditAsync(Audit audit)
        {
            await _systemDbContext.Audits.AddAsync(audit);
            await _systemDbContext.SaveChangesAsync();

            return audit.AuditId; // Assuming 'Id' is an integer
        }
    }
}
