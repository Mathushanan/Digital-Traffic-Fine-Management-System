using backend.Data;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Interfaces;

namespace backend.Services
{
    public class DisputeService: IDisputeService
    {
        private readonly SystemDbContext _systemDbContext;

        public DisputeService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
            
        }
        public async Task<int> AddDisputeAsync(Dispute dispute)
        {
            await _systemDbContext.Disputes.AddAsync(dispute);
            await _systemDbContext.SaveChangesAsync();
            return dispute.DisputeId;
        }
    }
}
