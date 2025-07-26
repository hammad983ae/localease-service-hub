import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, User, Building2, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery } from '@apollo/client';
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

interface ChatRoom {
  id: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ChatList: React.FC = () => {
  const { user } = useAuth();
  const { markAsRead } = useNotifications();
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const isCompany = user?.role === 'company';
  const { data, loading, error } = useQuery(
    isCompany ? GET_COMPANY_CHAT_ROOMS : GET_MY_CHAT_ROOMS
  );

  const chatRooms = data?.myChatRooms || data?.companyChatRooms || [];

  const handleChatRoomClick = (chatRoomId: string) => {
    setSelectedChatRoom(chatRoomId);
    setShowChat(true);
    // Mark chat as read when opened
    markAsRead(chatRoomId);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedChatRoom(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'moving': return 'Moving';
      case 'disposal': return 'Disposal';
      case 'transport': return 'Transport';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading chat rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading chat rooms: {error.message}</div>
      </div>
    );
  }

  if (showChat && selectedChatRoom) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleCloseChat}>
          ← Back to Chat Rooms
        </Button>
        <Chat chatRoomId={selectedChatRoom} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Secure Chats</h2>
        <Badge variant="secondary">
          {chatRooms.length} {chatRooms.length === 1 ? 'chat' : 'chats'}
        </Badge>
      </div>

      {chatRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
            <p className="text-muted-foreground text-center">
              {isCompany 
                ? "You'll see chat rooms here when customers approve your bookings."
                : "You'll see chat rooms here when companies approve your bookings."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {chatRooms.map((chatRoom: ChatRoom) => (
            <Card 
              key={chatRoom.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleChatRoomClick(chatRoom.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {isCompany ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {getBookingTypeLabel(chatRoom.bookingType)} Service
                        </h3>
                        <Badge variant="outline">
                          {chatRoom.bookingType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booking ID: {chatRoom.bookingId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Last updated
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(chatRoom.updatedAt)}
                      </p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList; 