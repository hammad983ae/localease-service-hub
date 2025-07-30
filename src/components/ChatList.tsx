import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  User, 
  Building2, 
  Calendar, 
  MapPin,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
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

const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($bookingId: ID!, $bookingType: String!) {
    booking(id: $bookingId) @include(if: $isMoving) {
      id
      status
      dateTime
      dateTimeFlexible
      addresses { from to }
      contact { name email phone }
      company { name email phone }
    }
    disposalBooking(id: $bookingId) @include(if: $isDisposal) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupAddress { fullAddress }
      contact { name email phone }
      company { name email phone }
    }
    transportBooking(id: $bookingId) @include(if: $isTransport) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupLocation { fullAddress }
      dropoffLocation { fullAddress }
      contact { name email phone }
      company { name email phone }
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
  
  const { data, loading, error } = useQuery(
    isCompany ? GET_COMPANY_CHAT_ROOMS : GET_MY_CHAT_ROOMS
  );

  const { data: adminChatData, loading: adminChatLoading } = useQuery(
    GET_ADMIN_CHAT_ROOMS,
    { skip: isCompany || isAdmin }
  );

  const chatRooms = data?.myChatRooms || data?.companyChatRooms || [];
  const adminChatRooms = adminChatData?.adminChatRooms || [];
  
  // Combine regular chat rooms with admin chat rooms for users
  const allChatRooms = isCompany || isAdmin ? chatRooms : [...chatRooms, ...adminChatRooms];

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
    // Mark chat as read when opened
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'moving': return 'Moving Service';
      case 'disposal': return 'Disposal Service';
      case 'transport': return 'Transport Service';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <Button variant="outline" onClick={handleCloseChat} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chat Rooms
        </Button>
        <Chat chatRoomId={selectedChatRoom} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Secure Chats
          </h2>
          <p className="text-muted-foreground mt-1">
            {isCompany 
              ? "Communicate with your customers"
              : "Chat with service providers"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {allChatRooms.length} {allChatRooms.length === 1 ? 'chat' : 'chats'}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search chats by booking ID or service type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {allChatRooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                0
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No chats yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {isCompany 
                ? "You'll see chat rooms here when customers approve your bookings. Start by accepting some service requests!"
                : "You'll see chat rooms here when companies approve your bookings. Start by creating some service requests!"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChatRooms.map((chatRoom: ChatRoom) => {
            const isUnread = unreadChats.has(chatRoom.id);
            
            return (
              <Card 
                key={chatRoom.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isUnread ? 'border-l-4 border-l-primary bg-blue-50/50' : ''
                }`}
                onClick={() => handleChatRoomClick(chatRoom.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-primary to-blue-600">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-white">
                            {isCompany ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                          </AvatarFallback>
                        </Avatar>
                        {isUnread && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            !
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {chatRoom.bookingType === 'moving' ? 'Moving Service' :
                             chatRoom.bookingType === 'disposal' ? 'Disposal Service' :
                             'Transport Service'}
                            {chatRoom.chatType === 'admin_user' && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Admin Support
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Booking #{chatRoom.bookingId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(chatRoom.updatedAt)}
                          </p>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Booking ID: {chatRoom.bookingId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>Created: {formatDate(chatRoom.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3" />
                            <span>Last updated: {formatDate(chatRoom.updatedAt)} at {formatTime(chatRoom.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredChatRooms.length === 0 && searchTerm && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No chats found</h3>
                <p className="text-muted-foreground text-center">
                  No chats match your search for "{searchTerm}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList; 