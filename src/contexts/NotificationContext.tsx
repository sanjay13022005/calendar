import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useEventContext } from './EventContext';
import { CalendarEvent } from './EventContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  eventId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { events } = useEventContext();

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = localStorage.getItem('calendar_notifications');
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('calendar_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Check for upcoming events every minute
    const checkUpcomingEvents = () => {
      const now = new Date();
      const currentTime = now.getTime();

      events.forEach((event: CalendarEvent) => {
        if (!event.reminder) return;

        const eventDateTime = new Date(`${event.date}T${event.startTime}`);
        const reminderTime = eventDateTime.getTime() - (event.reminder * 60 * 1000);

        // Check if it's time for reminder (within 1 minute window)
        if (currentTime >= reminderTime && currentTime < reminderTime + 60000) {
          const existingNotification = notifications.find(
            n => n.eventId === event.id && n.type === 'warning'
          );

          if (!existingNotification) {
            addNotification({
              title: 'Upcoming Event',
              message: `"${event.title}" starts in ${event.reminder} minutes`,
              type: 'warning',
              eventId: event.id,
            });

            toast(`🔔 Upcoming: ${event.title}`, {
              duration: 6000,
              style: {
                background: '#F59E0B',
                color: '#fff',
              },
            });
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    checkUpcomingEvents(); // Check immediately

    return () => clearInterval(interval);
  }, [events, notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('calendar_notifications');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};