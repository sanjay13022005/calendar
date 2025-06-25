import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  X, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  Check,
  Trash2
} from 'lucide-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import './NotificationPanel.css';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    unreadCount 
  } = useNotificationContext();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="icon-success" />;
      case 'warning': return <AlertCircle size={20} className="icon-warning" />;
      case 'error': return <XCircle size={20} className="icon-error" />;
      default: return <Info size={20} className="icon-info" />;
    }
  };

  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'error': return 'notification-error';
      default: return 'notification-info';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="notification-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="notification-panel glass"
        >
          {/* Header */}
          <div className="notification-header">
            <div className="header-title">
              <div className="title-content">
                <Bell size={24} />
                <h2 className="panel-title">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="unread-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="close-button"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Action Buttons */}
            {notifications.length > 0 && (
              <div className="header-actions">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={markAllAsRead}
                    className="action-button mark-read"
                  >
                    <Check size={16} />
                    <span>Mark all read</span>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearNotifications}
                  className="action-button clear-all"
                >
                  <Trash2 size={16} />
                  <span>Clear all</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`notification-item ${getNotificationClass(notification.type)} ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-text">
                        <div className="notification-title-row">
                          <h4 className="notification-title">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="unread-indicator" />
                          )}
                        </div>
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <p className="notification-time">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="empty-notifications"
                >
                  <Bell size={64} className="empty-icon" />
                  <h3 className="empty-title">
                    No notifications
                  </h3>
                  <p className="empty-message">
                    You're all caught up! Notifications will appear here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPanel;