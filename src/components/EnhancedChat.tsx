import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  User, 
  Building2,
  Clock,
  Check,
  CheckCheck,
  ArrowLeft,
  Search,
  Filter,
  MessageCircle,
  Calendar,
  MapPin,
  X,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Mic,
  VideoOff,
  PhoneOff,
  Settings,
  Info,
  Shield,
  CheckCircle,
  AlertTriangle,
  Heart,
  ThumbsUp,
  Reply,
  Forward,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'user' | 'company' | 'admin';
  createdAt: string;
  isRead: boolean;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

interface ChatRoom {
  _id: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  adminId?: string;
  companyId?: string;
  chatType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  participants?: Array<{
    id: string;
    name: string;
    type: 'user' | 'company' | 'admin';
    avatar?: string;
  }>;
}

interface EnhancedChatProps {
  onClose?: () => void;
  selectedChatRoomId?: string;
  chatRoomId?: string;
  chatRoomData?: any;
  isAdmin?: boolean;
  isCompany?: boolean;
}

const EnhancedChat: React.FC<EnhancedChatProps> = ({ 
  onClose, 
  selectedChatRoomId, 
  chatRoomId, 
  chatRoomData,
  isAdmin = false,
  isCompany = false
}) => {
  const providedRoomId = selectedChatRoomId || chatRoomId;
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentChatRoomRef = useRef<string | null>(null);
  const isEmbedded = Boolean(providedRoomId);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('EnhancedChat: Socket connected');
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('EnhancedChat: Socket disconnected');
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('EnhancedChat: New message received:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      setIsTyping(prev => ({ ...prev, [data.userId]: data.isTyping }));
    });

    newSocket.on('message_read', (data: { messageId: string }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // If chatRoomData is provided, use it directly
  useEffect(() => {
    if (chatRoomData) {
      console.log('EnhancedChat: Using provided chatRoomData:', chatRoomData);
      setSelectedChatRoom(chatRoomData);
      setLoading(false);
    }
  }, [chatRoomData]);

  // Fetch user's chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        let response;
        
        if (isAdmin) {
          response = await apiClient.getAdminChatRooms();
        } else if (isCompany) {
          response = await apiClient.getCompanyChatRooms();
        } else {
          response = await apiClient.getChatRooms();
        }
        
        const rooms = Array.isArray(response) ? response : (response.chatRooms || []);
        setChatRooms(rooms);
        
        if (providedRoomId) {
          const room = rooms.find((r: any) => r._id === providedRoomId || r.id === providedRoomId);
          if (room) {
            setSelectedChatRoom(room as any);
            fetchMessages(room._id || room.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!chatRoomData) {
      fetchChatRooms();
    }
  }, [providedRoomId, chatRoomData, isAdmin, isCompany]);

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await apiClient.getChatMessages(roomId);
      const messages = Array.isArray(response) ? response : (response.messages || []);
      setMessages(messages);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatRoom) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: user?.id || '',
      senderType: user?.role as 'user' | 'company' | 'admin',
      createdAt: new Date().toISOString(),
      isRead: false,
      replyTo: replyToMessage ? {
        id: replyToMessage.id,
        content: replyToMessage.content,
        senderName: replyToMessage.senderType === 'user' ? 'You' : 'Other'
      } : undefined
    };

    try {
      await apiClient.sendMessage(selectedChatRoom._id, message);
      setMessage('');
      setReplyToMessage(null);
      
      if (socket) {
        socket.emit('send_message', {
          chatRoomId: selectedChatRoom._id,
          content: message,
          replyTo: replyToMessage?.id
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (socket && selectedChatRoom) {
      socket.emit('typing_start', selectedChatRoom._id);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (socket) {
          socket.emit('typing_stop', selectedChatRoom._id);
        }
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const handleMessageAction = (action: string, message: Message) => {
    switch (action) {
      case 'reply':
        setReplyToMessage(message);
        setShowMessageActions(false);
        inputRef.current?.focus();
        break;
      case 'forward':
        // Handle forward logic
        break;
      case 'edit':
        // Handle edit logic
        break;
      case 'delete':
        // Handle delete logic
        break;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getSenderName = (message: Message) => {
    if (message.senderId === user?.id) {
      return 'You';
    }
    return message.senderType === 'admin' ? 'Admin' : 
           message.senderType === 'company' ? 'Company' : 'User';
  };

  const getSenderAvatar = (message: Message) => {
    if (message.senderId === user?.id) {
      return user?.avatar || undefined;
    }
    return undefined;
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

  return (
    <div className={`${isEmbedded ? 'flex h-full bg-background' : 'flex h-[calc(100vh-120px)] bg-card rounded-xl shadow-sm border border-border'} overflow-hidden`}>
      {/* Chat Rooms Sidebar */}
      {!isEmbedded && (
        <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Messages</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Chat Rooms List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chatRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => {
                    setSelectedChatRoom(room);
                    fetchMessages(room._id);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChatRoom?._id === room._id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {room.bookingType?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {room.bookingType} Booking
                        </p>
                        {room.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChatRoom(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedChatRoom.bookingType?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {selectedChatRoom.bookingType} Booking
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatRoom.bookingId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowChatInfo(true)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-muted/20">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessage(msg);
                      setShowMessageActions(true);
                    }}
                  >
                    <div className={`max-w-xs lg:max-w-md ${msg.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                      {msg.replyTo && (
                        <div className={`mb-1 text-xs text-muted-foreground ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                          Replying to: {msg.replyTo.content.substring(0, 30)}...
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          msg.senderId === user?.id
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-background text-foreground rounded-bl-md border border-border'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className={`flex items-center space-x-1 mt-1 ${
                        msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                        {msg.senderId === user?.id && (
                          <span className="text-xs text-muted-foreground">
                            {msg.isRead ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                    {msg.senderId !== user?.id && (
                      <Avatar className="h-8 w-8 ml-2 order-1">
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {getSenderName(msg).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {Object.values(isTyping).some(Boolean) && (
                  <div className="flex justify-start">
                      <div className="bg-background rounded-2xl px-4 py-2 border border-border">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary">
                      Replying to: {replyToMessage.content.substring(0, 50)}...
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToMessage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="border-0 bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary rounded-full px-4 py-2"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat room from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Message Actions Menu */}
      {showMessageActions && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-background rounded-lg shadow-lg p-2 min-w-[200px]">
            <button
              onClick={() => handleMessageAction('reply', selectedMessage)}
              className="w-full text-left px-4 py-2 hover:bg-muted rounded flex items-center space-x-2"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
            <button
              onClick={() => handleMessageAction('forward', selectedMessage)}
              className="w-full text-left px-4 py-2 hover:bg-muted rounded flex items-center space-x-2"
            >
              <Forward className="h-4 w-4" />
              <span>Forward</span>
            </button>
            {selectedMessage.senderId === user?.id && (
              <>
                <button
                  onClick={() => handleMessageAction('edit', selectedMessage)}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleMessageAction('delete', selectedMessage)}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded flex items-center space-x-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowMessageActions(false)}
              className="w-full text-left px-4 py-2 hover:bg-muted rounded flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChat;
