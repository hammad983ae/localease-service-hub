import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  User, 
  Building2, 
  Calendar, 
  Clock,
  ArrowLeft,
  Search,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { useNotifications } from '@/contexts/NotificationContext';
import Chat from './Chat';

const GET_MY_CHAT_ROOMS = gql`
  query MyChatRooms {
    myChatRooms {
      id
      bookingId
      bookingType
      userId
      companyId
      adminId
      chatType
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_ADMIN_CHAT_ROOMS = gql`
  query AdminChatRooms {
    adminChatRooms {
      id
      bookingId
      bookingType
      userId
      adminId
      chatType
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_COMPANY_CHAT_ROOMS = gql`
  query CompanyChatRooms {
    companyChatRooms {
      id
      bookingId
      bookingType
      userId
      companyId
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Subscription for real-time chat room updates
const CHAT_ROOM_UPDATED_SUBSCRIPTION = gql`
  subscription OnChatRoomUpdated {
    chatRoomUpdated {
      id
      bookingId
      bookingType
      userId
      companyId
      adminId
      chatType
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Subscription for new messages (to update unread counts)
const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      content
      senderId
      senderType
      createdAt
      isRead
    }
  }
`;

interface ChatRoom {
  id: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  companyId?: string;
  adminId?: string;
  chatType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatListProps {
  initialBookingId?: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ initialBookingId }) => {
  const { user } = useAuth();
  const { markAsRead, unreadChats } = useNotifications();
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isCompany = user?.role === 'company';
  const isAdmin = user?.role === 'admin';
  
  const { data, loading, error, refetch } = useQuery(
    isCompany ? GET_COMPANY_CHAT_ROOMS : GET_MY_CHAT_ROOMS,
    {
      fetchPolicy: 'network-only',
    }
  );

  const { data: adminChatData, loading: adminChatLoading, refetch: refetchAdmin } = useQuery(
    GET_ADMIN_CHAT_ROOMS,
    { 
      skip: isCompany || isAdmin,
      fetchPolicy: 'network-only',
    }
  );

  // Subscribe to chat room updates
  const { data: chatRoomUpdateData } = useSubscription(CHAT_ROOM_UPDATED_SUBSCRIPTION, {
    skip: !user,
    onData: ({ data }) => {
      if (data?.data?.chatRoomUpdated) {
        console.log('Chat room updated via subscription:', data.data.chatRoomUpdated);
        // Refetch chat rooms to get updated data
        refetch();
        if (!isCompany && !isAdmin) {
          refetchAdmin();
        }
      }
    },
    onError: (error) => {
      console.error('Chat room subscription error:', error);
    }
  });

  // Subscribe to new messages for all chat rooms to update unread counts
  const chatRooms = data?.myChatRooms || data?.companyChatRooms || [];
  const adminChatRooms = adminChatData?.adminChatRooms || [];
  const allChatRooms = isCompany || isAdmin ? chatRooms : [...chatRooms, ...adminChatRooms];

  // Subscribe to messages for each chat room
  allChatRooms.forEach((chatRoom: ChatRoom) => {
    useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
      variables: { chatRoomId: chatRoom.id },
      skip: !chatRoom.id,
      onData: ({ data }) => {
        if (data?.data?.messageAdded) {
          const message = data.data.messageAdded;
          // Only mark as unread if message is not from current user
          if (message.senderId !== user?.id) {
            console.log('New message in chat room:', chatRoom.id, 'from:', message.senderId);
            // The notification context will handle updating unread counts
          }
        }
      },
      onError: (error) => {
        console.error('Message subscription error for chat room:', chatRoom.id, error);
      }
    });
  });

  // Auto-open chat for specific booking if initialBookingId is provided
  React.useEffect(() => {
    if (initialBookingId && allChatRooms.length > 0) {
      const targetChatRoom = allChatRooms.find((chatRoom: ChatRoom) => 
        chatRoom.bookingId === initialBookingId
      );
      if (targetChatRoom) {
        setSelectedChatRoom(targetChatRoom.id);
        setShowChat(true);
        markAsRead(targetChatRoom.id);
      }
    }
  }, [initialBookingId, allChatRooms, markAsRead]);

  const handleChatRoomClick = (chatRoomId: string) => {
    setSelectedChatRoom(chatRoomId);
    setShowChat(true);
    markAsRead(chatRoomId);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedChatRoom(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'moving': return 'Moving Service';
      case 'disposal': return 'Disposal Service';
      case 'transport': return 'Transport Service';
      default: return type;
    }
  };

  const filteredChatRooms = allChatRooms.filter((chatRoom: ChatRoom) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      chatRoom.bookingId.toLowerCase().includes(searchLower) ||
      chatRoom.bookingType.toLowerCase().includes(searchLower)
    );
  });

  if (loading || adminChatLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Chats</h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (showChat && selectedChatRoom) {
    return (
      <div className="h-full">
        <Chat chatRoomId={selectedChatRoom} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Simple Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-500">
              {isCompany 
                ? "Communicate with your customers"
                : "Chat with service providers and support"
              }
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {allChatRooms.length} chats
          </Badge>
        </div>

        {/* Simple Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {allChatRooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isCompany 
                ? "You'll see chat rooms here when customers approve your bookings."
                : "You'll see chat rooms here when companies approve your bookings."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChatRooms.map((chatRoom: ChatRoom) => {
              const isUnread = unreadChats.has(chatRoom.id);
              
              return (
                <div 
                  key={chatRoom.id} 
                  className={`p-4 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                    isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleChatRoomClick(chatRoom.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {chatRoom.chatType === 'admin_user' ? (
                          <MessageCircle className="h-5 w-5" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {getBookingTypeLabel(chatRoom.bookingType)}
                          {chatRoom.chatType === 'admin_user' && (
                            <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">
                              Support
                            </Badge>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(chatRoom.updatedAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">
                        Booking #{chatRoom.bookingId}
                      </p>
                    </div>
                    
                    {isUnread && (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredChatRooms.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No chats found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 