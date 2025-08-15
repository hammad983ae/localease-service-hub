import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  X, 
  User, 
  Building2, 
  Calendar, 
  MapPin, 
  Package,
  MoreVertical,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowLeft,
  MessageCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

interface ChatRoom {
  _id: string; // MongoDB ObjectId
  bookingId: string;
  bookingType: string;
  userId: string;
  adminId: string;
  chatType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

interface Booking {
  id: string;
  status: string;
  dateTime?: string;
  dateTimeFlexible?: string;
  addresses?: { from: string; to: string };
  contact?: { name: string; email: string; phone: string; notes: string };
  rooms?: Array<{ room: string; floor: number; count: number }>;
  items?: any[];
  serviceType?: string;
  pickupAddress?: { fullAddress: string };
}

interface AdminChatProps {
  onClose?: () => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChatRoomRef = useRef<string | null>(null); // Track current chat room

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create Socket.IO connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket.IO connected for admin chat');
      setError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setError('Connection failed. Trying to reconnect...');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    // Chat events
    newSocket.on('new_message', (data) => {
      console.log('New message received:', data);
      if (data.message && selectedChatRoom && data.message.chatRoomId === selectedChatRoom._id) {
        setMessages(prev => [...prev, {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.senderId,
          senderType: data.message.senderType,
          createdAt: data.message.createdAt
        }]);
      }
    });

    newSocket.on('chat_room_updated', (data) => {
      console.log('Chat room updated:', data);
      // Update chat room list if needed
      setChatRooms(prev => prev.map(room => 
        room._id === data.chatRoomId 
          ? { ...room, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt, updatedAt: data.updatedAt }
          : room
      ));
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== user?.id) {
        setIsTyping(prev => ({ ...prev, [data.userId]: true }));
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.userId !== user?.id) {
        setIsTyping(prev => ({ ...prev, [data.userId]: false }));
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      toast({
        title: "Error",
        description: error.message || "Socket error occurred",
        variant: "destructive",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.id, toast]);

  // Join chat room when selected
  useEffect(() => {
    if (socket && selectedChatRoom?._id) {
      console.log('Attempting to join chat room:', selectedChatRoom._id);
      console.log('Selected chat room data:', selectedChatRoom);
      
      // Only leave previous room if we're actually changing rooms
      if (currentChatRoomRef.current && currentChatRoomRef.current !== selectedChatRoom._id) {
        console.log('Leaving previous room:', currentChatRoomRef.current);
        socket.emit('leave_room', { roomId: currentChatRoomRef.current });
      }
      
      // Join new room
      socket.emit('join_room', { roomId: selectedChatRoom._id });
      console.log('Joined chat room:', selectedChatRoom._id);
      
      // Update current chat room reference
      currentChatRoomRef.current = selectedChatRoom._id;
    }
  }, [selectedChatRoom?._id, socket]); // Only depend on the ID, not the entire object

  // Fetch admin chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAdminChatRooms();
        setChatRooms(response.chatRooms || []);
      } catch (err: any) {
        console.error('Error fetching chat rooms:', err);
        setError(err.message || 'Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  // Fetch chat room info and messages when a chat room is selected
  useEffect(() => {
    if (!selectedChatRoom) return;

    const fetchChatRoomData = async () => {
      if (!selectedChatRoom?._id) return;
      
      try {
        // Fetch chat room details
        const chatRoomResponse = await apiClient.getChatRoomDetails(selectedChatRoom._id);
        
        // Fetch messages
        const messagesResponse = await apiClient.getChatMessages(selectedChatRoom._id);
        setMessages(messagesResponse.messages || []);
        
        // For now, we'll set a basic booking structure
        // In a real implementation, you'd fetch the specific booking details
        setCurrentBooking({
          id: selectedChatRoom.bookingId,
          status: 'pending',
          serviceType: selectedChatRoom.bookingType
        });
      } catch (error) {
        console.error('Error fetching chat room data:', error);
        toast({
          title: "Error",
          description: "Failed to load chat room data",
          variant: "destructive",
        });
      }
    };

    fetchChatRoomData();
  }, [selectedChatRoom, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && selectedChatRoom?._id) {
      socket.emit('typing_start', { roomId: selectedChatRoom._id });
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        socket.emit('typing_stop', { roomId: selectedChatRoom._id });
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleChatRoomClick = (chatRoomId: string) => {
    const chatRoom = chatRooms.find(room => room._id === chatRoomId);
    if (chatRoom) {
      setSelectedChatRoom(chatRoom);
    }
  };

  const handleCloseChat = () => {
    setSelectedChatRoom(null);
    setMessages([]);
    setCurrentBooking(null);
    if (onClose) onClose();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom || !socket) return;

    try {
      console.log('Sending message to chat room:', selectedChatRoom._id);
      console.log('Selected chat room:', selectedChatRoom);
      
      // Send message via Socket.IO
      socket.emit('send_message', {
        chatRoomId: selectedChatRoom._id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      // Clear input immediately for better UX
      setNewMessage('');
      
      // Optimistically add the message to the UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        senderId: user?.id || '',
        senderType: 'admin',
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      socket.emit('typing_stop', { roomId: selectedChatRoom._id });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceTypeLabel = () => {
    if (!currentBooking?.serviceType) return 'Unknown Service';
    
    const labels: { [key: string]: string } = {
      'moving': 'Moving Service',
      'disposal': 'Disposal Service',
      'transport': 'Transport Service'
    };
    
    return labels[currentBooking.serviceType] || currentBooking.serviceType;
  };

  const getBookingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading chat</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-6">
      <div className="flex h-full bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Chat Rooms List */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/30">
          <div className="p-6 border-b border-border bg-background">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Admin Chat</h3>
                <p className="text-sm text-muted-foreground">{chatRooms.length} active rooms</p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chatRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleChatRoomClick(room._id)}
                  className={`group p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedChatRoom?._id === room._id
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {room.bookingType} #{room.bookingId}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {room.chatType}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={room.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {room.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedChatRoom ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-background">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {getServiceTypeLabel()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Room #{selectedChatRoom._id.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {currentBooking && (
                  <Badge variant="outline" className="bg-background">
                    {currentBooking.status}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || `message-${index}`}
                    className={`flex ${
                      message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                      {message.senderType !== 'admin' && (
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-3 rounded-xl ${
                          message.senderType === 'admin'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground border border-border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderType === 'admin' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                      {message.senderType === 'admin' && (
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            <Shield className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message Input */}
            <div className="p-6 border-t border-border bg-background">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-12 h-11 bg-muted/50 border-border"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="absolute right-1 top-1 h-9 w-9 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="p-6 bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a chat room</h3>
              <p className="text-muted-foreground">
                Choose a conversation to start managing customer support
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat; 