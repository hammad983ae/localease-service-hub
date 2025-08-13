import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  FileText,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

interface ChatRoom {
  id: string;
  _id?: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  adminId: string;
  chatType: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface Message {
  id: string;
  _id?: string;
  content: string;
  senderId: string;
  senderType: string;
  messageType: string;
  createdAt: string;
  companyProfile?: any;
  invoice?: any;
  actions?: any[];
}

interface Booking {
  id: string;
  _id?: string;
  status: string;
  dateTime?: string;
  dateTimeFlexible?: string;
  addresses?: { from: string; to: string };
  contact?: { name: string; email: string; phone: string; notes: string };
  rooms?: Array<{ room: string; floor: number; count: number }>;
  items?: any[];
  serviceType?: string;
  pickupAddress?: { fullAddress: string };
  type?: string;
}

interface Company {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  services: string[];
  priceRange: string;
  rating: number;
  totalReviews: number;
}

interface EnhancedAdminChatProps {
  onClose?: () => void;
}

const EnhancedAdminChat: React.FC<EnhancedAdminChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected for enhanced admin chat');
      setError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setError('Connection failed. Trying to reconnect...');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    // Chat events
    newSocket.on('new_message', (data) => {
      console.log('New message received:', data);
      if (data.message && selectedChatRoom && data.message.chatRoomId === selectedChatRoom.id) {
        setMessages(prev => [...prev, {
          id: data.message.id,
          content: data.message.content,
          senderId: data.message.senderId,
          senderType: data.message.senderType,
          messageType: data.message.messageType,
          createdAt: data.message.createdAt,
          companyProfile: data.message.companyProfile,
          invoice: data.message.invoice,
          actions: data.message.actions
        }]);
      }
    });

    newSocket.on('chat_room_updated', (data) => {
      console.log('Chat room updated:', data);
      setChatRooms(prev => prev.map(room => 
        room.id === data.chatRoomId 
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
    if (socket && selectedChatRoom?.id) {
      socket.emit('leave_room', { roomId: selectedChatRoom.id });
      socket.emit('join_room', { roomId: selectedChatRoom.id });
      console.log('Joined chat room:', selectedChatRoom.id);
    }
  }, [selectedChatRoom, socket]);

  // Fetch admin chat rooms and companies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [chatRoomsResponse, companiesResponse] = await Promise.all([
          apiClient.getAdminChatRooms(),
          apiClient.getAdminCompanies()
        ]);
        
        setChatRooms(chatRoomsResponse.chatRooms || []);
        setCompanies(companiesResponse.companies || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch chat room info and messages when a chat room is selected
  useEffect(() => {
    if (!selectedChatRoom) return;

    const fetchChatRoomData = async () => {
      if (!selectedChatRoom?.id) return;
      
      try {
        // Fetch chat room details
        const chatRoomResponse = await apiClient.getChatRoomDetails(selectedChatRoom.id);
        
        // Fetch messages
        const messagesResponse = await apiClient.getChatMessages(selectedChatRoom.id);
        setMessages(messagesResponse.messages || []);
        
        // For now, we'll set a basic booking structure
        setCurrentBooking({
          id: selectedChatRoom.bookingId,
          status: 'approved',
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
    if (socket && selectedChatRoom?.id) {
      socket.emit('typing_start', { chatRoomId: selectedChatRoom.id });
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        socket.emit('typing_stop', { chatRoomId: selectedChatRoom.id });
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleChatRoomClick = (chatRoomId: string) => {
    const chatRoom = chatRooms.find(room => room.id === chatRoomId);
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
      socket.emit('send_message', {
        chatRoomId: selectedChatRoom.id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      socket.emit('typing_stop', { chatRoomId: selectedChatRoom.id });

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
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const sendCompanyProfile = async (company: Company) => {
    if (!selectedChatRoom || !socket) return;

    try {
      const messageData = {
        chatRoomId: selectedChatRoom.id,
        content: `Company Profile: ${company.name}`,
        messageType: 'company_profile',
        companyProfile: {
          companyId: company.id || company._id,
          companyName: company.name,
          companyEmail: company.email,
          companyPhone: company.phone,
          services: company.services,
          priceRange: company.priceRange,
          rating: company.rating,
          totalReviews: company.totalReviews
        }
      };

      socket.emit('send_message', messageData);

      toast({
        title: "Success",
        description: `Company profile sent for ${company.name}`,
      });

    } catch (error) {
      console.error('Error sending company profile:', error);
      toast({
        title: "Error",
        description: "Failed to send company profile",
        variant: "destructive",
      });
    }
  };

  const sendInvoice = async (amount: number) => {
    if (!selectedChatRoom || !socket) return;

    try {
      const messageData = {
        chatRoomId: selectedChatRoom.id,
        content: `Invoice: $${amount}`,
        messageType: 'invoice',
        invoice: {
          amount: amount,
          currency: 'USD',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'pending'
        }
      };

      socket.emit('send_message', messageData);

      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });

    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
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
          <p className="text-muted-foreground">Loading enhanced chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading enhanced chat</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat Rooms List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Service Chats</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {chatRooms.map((room) => (
              <div
                key={room.id || room._id}
                onClick={() => handleChatRoomClick(room.id || room._id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChatRoom?.id === (room.id || room._id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {room.bookingType} #{room.bookingId}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {room.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  <Badge 
                    variant={room.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {room.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedChatRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header with Booking Details */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getServiceTypeLabel()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Booking #{selectedChatRoom.bookingId}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentBooking && (
                  <Badge className={getBookingStatusColor(currentBooking.status)}>
                    {currentBooking.status}
                  </Badge>
                )}
                
                {/* Company Profile Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      Send Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Company Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      {companies.map((company) => (
                        <div key={company.id || company._id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{company.name}</h4>
                              <p className="text-sm text-gray-600">{company.email}</p>
                              <p className="text-xs text-gray-500">{company.services.join(', ')}</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => sendCompanyProfile(company)}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Invoice Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Send Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Amount (USD)</label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          id="invoice-amount"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const amount = parseFloat((document.getElementById('invoice-amount') as HTMLInputElement).value);
                          if (amount > 0) {
                            sendInvoice(amount);
                          }
                        }}
                      >
                        Send Invoice
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || message._id || `message-${index}`}
                  className={`flex ${
                    message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'admin'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Company Profile Display */}
                    {message.messageType === 'company_profile' && message.companyProfile && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{message.companyProfile.companyName}</span>
                        </div>
                        <p className="text-xs mt-1">{message.companyProfile.companyEmail}</p>
                        <p className="text-xs">{message.companyProfile.services.join(', ')}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">{message.companyProfile.rating}</span>
                          <span className="text-xs ml-1">({message.companyProfile.totalReviews} reviews)</span>
                        </div>
                      </div>
                    )}

                    {/* Invoice Display */}
                    {message.messageType === 'invoice' && message.invoice && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">Invoice</span>
                        </div>
                        <p className="text-lg font-bold">${message.invoice.amount}</p>
                        <p className="text-xs">Due: {formatDate(message.invoice.dueDate)}</p>
                        <p className="text-xs">Status: {message.invoice.status}</p>
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${
                      message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {Object.values(isTyping).some(Boolean) && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm">Someone is typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a service chat to begin</p>
            <p className="text-sm">Choose from the list on the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminChat;
