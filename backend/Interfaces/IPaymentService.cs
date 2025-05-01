using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreateCheckoutSessionAsync(int fineId,decimal? amount,string description);
        Task<bool> AddPaymentAsync(Payment payment);
        Task<bool> ConfirmPaymentAsync(string sessionId);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetTotalRevenueByStationIdAsync(int stationId);
        Task<decimal> GetTotalRevenueByIssuerIdAsync(int issuerId);
        Task<decimal> GetTotalRevenueByOffenderIdAsync(int offenderId);
    }
}
