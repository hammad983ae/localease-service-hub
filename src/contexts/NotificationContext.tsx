import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

interface NotificationContextType {
  unreadCount: number;
  unreadChats: Set<string>;
  markAsRead: (chatRoomId: string) => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    refreshUnreadCount();
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshUnreadCount = async () => {
    try {
      const response = await apiClient.getUnreadCount();
      const { unreadCount: count, unreadChats: chats } = response;
      
      setUnreadCount(count);
      setUnreadChats(new Set(chats.map((chat: any) => chat.roomId)));
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (chatRoomId: string) => {
    try {
      await apiClient.markMessageAsRead(chatRoomId);
      
      // Update local state
      setUnreadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatRoomId);
        return newSet;
      });
      
      // Refresh unread count
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const value: NotificationContextType = {
    unreadCount,
    unreadChats,
    markAsRead,
    refreshUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 