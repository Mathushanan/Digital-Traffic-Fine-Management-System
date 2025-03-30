using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface INotificationService
    {
        Task<int> AddNotificationAsync(Notification notification);
        Task<List<Notification>> GetAllNotificationsBySenderEmailAsync(string senderEmail);
        Task<List<Notification>> GetAllStationAdminNotificationsBySenderEmailAsync(string senderEmail);
    }
}
