'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, type Notification } from '@/types';
import { socketService } from '@/services/socket';
import { apiService } from '@/services/api';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  refreshNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const refreshNotifications = useCallback(async () => {
    if (currentUser) {
      try {
        const userNotifications = await apiService.getUserNotifications(currentUser.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Failed to refresh notifications:', error);
      }
    }
  }, [currentUser]);

  // Setup socket connection when current user changes
  useEffect(() => {
    if (currentUser) {
      socketService.connect(currentUser.id);
      
      const handleNotification = (data: unknown) => {
        const notification = data as Notification;
        addNotification(notification);
        // Show browser notification if permission granted
        if (window.Notification && window.Notification.permission === 'granted') {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      };

      socketService.on('notification', handleNotification);

      // Load initial notifications
      refreshNotifications();

      return () => {
        socketService.off('notification', handleNotification);
      };
    } else {
      socketService.disconnect();
    }
  }, [currentUser, refreshNotifications]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission();
      }
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        notifications,
        setNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
