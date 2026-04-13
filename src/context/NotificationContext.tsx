'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'purchase' | 'sale' | 'dividend' | 'ex_dividend' | 'earnings' | 'general' | 'price_alert';
  title: string;
  message: string;
  ticker?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'starkflow_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    saveNotifications([newNotification, ...notifications].slice(0, 50));
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id: string) => {
    saveNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    saveNotifications(notifications.map(n => ({ ...n, read: true })));
  }, [notifications, saveNotifications]);

  const clearNotification = useCallback((id: string) => {
    saveNotifications(notifications.filter(n => n.id !== id));
  }, [notifications, saveNotifications]);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
