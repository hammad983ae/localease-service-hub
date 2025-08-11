import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { io, Socket } from 'socket.io-client';

interface NotificationContextType {
  unreadCount: number;
  unreadChats: Set<string>;
  markAsRead: (chatRoomId: string) => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        const response = await apiClient.getUnreadCount();
        setUnreadCount(response.unreadCount || 0);
        setUnreadChats(new Set(response.unreadChats || []));
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user]);

  // Socket.IO connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    // Create Socket.IO connection
    const socket = io('http://localhost:5002', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected for notifications');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    socket.on('new_message', (data) => {
      // Only mark as unread if message is not from current user
      if (data.message.senderId !== user?.id) {
        setUnreadCount(prev => prev + 1);
        setUnreadChats(prev => new Set([...prev, data.message.chatRoomId]));
        
        // Show toast notification
        toast({
          title: "New Message",
          description: `New message in chat room #${data.message.chatRoomId}`,
        });
      }
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Socket error occurred",
        variant: "destructive"
      });
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, toast]);

  const markAsRead = async (chatRoomId: string) => {
    try {
      await apiClient.markMessageAsRead(chatRoomId);
      
      // Update local state
      setUnreadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatRoomId);
        return newSet;
      });
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
    setUnreadChats(new Set());
  };

  const value = {
    unreadCount,
    unreadChats,
    markAsRead,
    resetUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}; 