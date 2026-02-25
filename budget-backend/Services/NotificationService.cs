using InternalBudgetTracker.Data;
using InternalBudgetTracker.Enum;
using InternalBudgetTracker.Models;

namespace InternalBudgetTracker.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        // CREATE NOTIFICATION
        public void CreateNotification(
            int toUserId,
            NotificationType type,
            string message)
        {
            var notification = new Notification
            {
                ToUserId = toUserId,
                Type = type,
                Message = message,
                Status = ReadStatus.Unread,
                CreatedDate = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            _context.SaveChanges();
        }

        public List<Notification> GetNotifications(int userId)
        {
            return _context.Notifications
                .Where(n =>
                    n.ToUserId == userId &&
                    n.Status == ReadStatus.Unread)
                .OrderByDescending(n => n.CreatedDate)
                .ToList();
        }


        // UNREAD COUNT (Bell icon)

        public int GetUnreadCount(int userId)
        {
            return _context.Notifications
                .Count(n => n.ToUserId == userId && n.Status == ReadStatus.Unread);
        }


        // MARK AS READ
    
        public bool MarkAsRead(int notificationId, int userId)
        {
            var notification = _context.Notifications
                .FirstOrDefault(n =>
                    n.NotificationId == notificationId &&
                    n.ToUserId == userId);

            if (notification == null)
                return false;

            notification.Status = ReadStatus.Read;
            _context.SaveChanges();
            return true;
        }
    }

}


