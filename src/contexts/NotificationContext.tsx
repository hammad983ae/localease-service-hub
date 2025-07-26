import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { gql, useSubscription, useQuery } from '@apollo/client';
import { useToast } from '@/hooks/use-toast';

const GET_MY_CHAT_ROOMS = gql`
  query GetMyChatRooms {
    myChatRooms {
      id
      bookingId
      bookingType
      userId
      companyId
      isActive
      updatedAt
    }
  }
`;

const GET_COMPANY_CHAT_ROOMS = gql`
  query GetCompanyChatRooms {
    companyChatRooms {
      id
      bookingId
      bookingType
      userId
      companyId
      isActive
      updatedAt
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      chatRoomId
      senderId
      senderType
      content
      messageType
      isRead
      createdAt
    }
  }
`;

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

  // Get user's chat rooms
  const { data: userChatRoomsData } = useQuery(GET_MY_CHAT_ROOMS, {
    skip: !user || user.role === 'company',
  });

  const { data: companyChatRoomsData } = useQuery(GET_COMPANY_CHAT_ROOMS, {
    skip: !user || user.role !== 'company',
  });

  // Combine chat rooms
  const chatRooms = userChatRoomsData?.myChatRooms || companyChatRoomsData?.companyChatRooms || [];
  console.log('NotificationContext - Chat rooms:', chatRooms);

  // For now, we'll subscribe to the first chat room only
  // This is a simplified approach to avoid hooks violations
  // TODO: In a production app, implement a more sophisticated subscription
  // management system that can handle multiple chat rooms simultaneously
  const firstChatRoom = chatRooms.length > 0 ? chatRooms[0] : null;
  
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    skip: !user || !firstChatRoom?.id,
    variables: { chatRoomId: firstChatRoom?.id || '' },
  });

  // Listen to subscription data
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      const newMessage = subscriptionData.messageAdded;
      
      // Only count messages from other users/companies
      const isFromOtherUser = newMessage.senderId !== user?.id;
      const isFromOtherCompany = user?.role === 'company' && newMessage.senderType === 'user';
      const isFromOtherUserToCompany = user?.role === 'user' && newMessage.senderType === 'company';
      
      // Debug logging
      console.log('Notification check:', {
        newMessage,
        user,
        isFromOtherUser,
        isFromOtherCompany,
        isFromOtherUserToCompany,
        senderId: newMessage.senderId,
        userId: user?.id
      });
      
      if (isFromOtherUser || isFromOtherCompany || isFromOtherUserToCompany) {
        setUnreadChats(prev => new Set([...prev, newMessage.chatRoomId]));
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification for new message
        const senderName = newMessage.senderType === 'company' ? 'Company' : 'User';
        toast({
          title: "New Message",
          description: `${senderName} sent you a message`,
          duration: 3000,
        });
      }
    }
  }, [subscriptionData, user, toast]);

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

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      unreadChats,
      markAsRead,
      resetUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 