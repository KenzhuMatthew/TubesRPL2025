// components/notification/NotificationItem.jsx
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  FileText,
  Bell 
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';

const NOTIFICATION_CONFIG = {
  SESSION_REQUESTED: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  SESSION_APPROVED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  SESSION_REJECTED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  SESSION_UPDATED: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  SESSION_CANCELLED: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  SESSION_REMINDER: {
    icon: Bell,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  NOTE_ADDED: {
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
};

const NotificationItem = ({ notification, onClick, onMarkAsRead }) => {
  const config = NOTIFICATION_CONFIG[notification.type] || {
    icon: Bell,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  };

  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-medium ${
              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </h4>
            
            {!notification.isRead && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatRelativeTime(notification.createdAt)}
            </span>

            {notification.link && (
              <span className="text-xs text-blue-600 font-medium">
                Lihat Detail →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;