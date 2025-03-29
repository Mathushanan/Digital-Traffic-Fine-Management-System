using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;


using backend.Models;

namespace backend.Services
{
    public class NotificationService:INotificationService
    {
        private readonly SystemDbContext _systemDbContext;

        public NotificationService(SystemDbContext systemDbContext)
        {
            this._systemDbContext = systemDbContext;
        }

        public async Task<int> AddNotificationAsync(Notification notification)
        {
            await _systemDbContext.Notifications.AddAsync(notification);
            await _systemDbContext.SaveChangesAsync();

            return notification.NotificationId;
        }

        public async Task<List<Notification>> GetAllNotificationsBySenderEmailAsync(string senderEmail)
        {
            return await _systemDbContext.Notifications
                .Where(n => n.NotifiedBy == senderEmail )
                .ToListAsync();
        }


    }
}
