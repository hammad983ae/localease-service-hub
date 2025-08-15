import React, { useState, useEffect, useRef } from 'react';
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
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/api/client';
import EnhancedChat from './EnhancedChat';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

interface ChatRoom {
  _id: string; // MongoDB ObjectId
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
  const { unreadCount, unreadChats, markAsRead } = useNotifications();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(initialBookingId || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch chat rooms based on user role
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getChatRooms();
        // Backend returns array directly, not wrapped in chatRooms object
        const rooms = Array.isArray(response) ? response : (response.chatRooms || []);
        setChatRooms(rooms);
        setFilteredRooms(rooms);
        console.log('Fetched chat rooms:', rooms);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create Socket.IO connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected for chat list');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    newSocket.on('chat_room_updated', (data) => {
      // Refresh chat rooms when a room is updated
      apiClient.getChatRooms().then(response => {
        const rooms = Array.isArray(response) ? response : (response.chatRooms || []);
        setChatRooms(rooms);
        setFilteredRooms(rooms);
      });
    });

    newSocket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Filter chat rooms based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(chatRooms);
    } else {
      const filtered = chatRooms.filter(room => 
        room.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.bookingType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, chatRooms]);

  const handleChatRoomClick = (chatRoomId: string) => {
    const chatRoom = chatRooms.find(room => room._id === chatRoomId);
    if (chatRoom) {
      setSelectedChatRoom(chatRoomId);
      markAsRead(chatRoomId);
    }
  };

  const handleCloseChat = () => {
    setSelectedChatRoom(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'moving': 'Moving Service',
      'disposal': 'Disposal Service',
      'transport': 'Transport Service'
    };
    return labels[type] || type;
  };

  const getChatTypeIcon = (chatType: string) => {
    switch (chatType) {
      case 'admin_user':
        return <User className="h-4 w-4" />;
      case 'company_user':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getChatTypeLabel = (chatType: string) => {
    switch (chatType) {
      case 'admin_user':
        return 'Admin Chat';
      case 'company_user':
        return 'Company Chat';
      default:
        return 'Chat';
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No chats yet</h3>
        <p className="text-gray-600 mb-4">
          When you have active bookings or need support, chat rooms will appear here.
        </p>
        <Button onClick={() => window.location.href = '/moving'} className="mt-4">
          Book a Service
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-background rounded-lg shadow">
      {/* Chat Rooms List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Chats</h2>
            {unreadCount > 0 && <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>}
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No chats match your search' : 'Start a conversation to see your chats here'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChatRoom === room._id
                      ? 'bg-accent border border-accent'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleChatRoomClick(room._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getChatTypeIcon(room.chatType)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getChatTypeLabel(room.chatType)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {getBookingTypeLabel(room.bookingType)} #{room.bookingId}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                      <div className="flex flex-col items-end space-y-1">
                        {unreadChats.has(room._id) && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0.5">New</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(room.updatedAt)}
                        </span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChatRoom ? (
        <EnhancedChat onClose={handleCloseChat} selectedChatRoomId={selectedChatRoom} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a chat to start messaging</p>
            <p className="text-sm">Choose from the list on the left to begin a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList; 