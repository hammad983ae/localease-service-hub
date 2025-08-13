import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  unreadChats: Set<string>;
  sendMessage: (chatRoomId: string, content: string) => void;
  joinChat: (chatRoomId: string) => void;
  leaveChat: (chatRoomId: string) => void;
  startTyping: (chatRoomId: string) => void;
  stopTyping: (chatRoomId: string) => void;
  markAsRead: (chatRoomId: string) => void;
  resetUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      // Authenticate with the server
      const token = localStorage.getItem('token');
      console.log('Attempting to authenticate with token:', token ? 'Token exists' : 'No token');
      
      if (token) {
        console.log('Emitting authenticate event with token');
        socket.emit('authenticate', token);
      } else {
        console.log('No token found, cannot authenticate');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Authentication events
    socket.on('authenticated', (data) => {
      console.log('Socket authenticated successfully:', data);
    });

    socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
    });

    // Chat events
    socket.on('new_message', (message) => {
      console.log('New message received via socket in SocketContext:', message);
      
      // Update unread counts if message is from another user
      if (message.senderId !== user?.id) {
        console.log('Updating unread counts for message from another user');
        setUnreadChats(prev => new Set([...prev, message.chatRoomId]));
        setUnreadCount(prev => prev + 1);
      } else {
        console.log('Message is from current user, not updating unread counts');
      }
    });

    socket.on('chat_updated', (data) => {
      console.log('Chat updated via socket in SocketContext:', data);
    });

    socket.on('user_typing', (data) => {
      console.log('User typing via socket in SocketContext:', data);
    });

    socket.on('user_stopped_typing', (data) => {
      console.log('User stopped typing via socket in SocketContext:', data);
    });

    socket.on('error', (error) => {
      console.error('Socket error in SocketContext:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  const sendMessage = (chatRoomId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { chatRoomId, content });
    }
  };

  const joinChat = (chatRoomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_chat', chatRoomId);
    }
  };

  const leaveChat = (chatRoomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_chat', chatRoomId);
    }
  };

  const startTyping = (chatRoomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', chatRoomId);
    }
  };

  const stopTyping = (chatRoomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', chatRoomId);
    }
  };

  const markAsRead = (chatRoomId: string) => {
    setUnreadChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatRoomId);
      return newSet;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
    setUnreadChats(new Set());
  };

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    unreadChats,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    markAsRead,
    resetUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
