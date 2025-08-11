import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'user' | 'company' | 'admin';
  createdAt: string;
  isRead: boolean;
}

interface ChatRoom {
  _id: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  adminId: string;
  chatType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatProps {
  onClose: () => void;
  selectedChatRoomId?: string;
  chatRoomId?: string;
}

const Chat: React.FC<ChatProps> = ({ onClose, selectedChatRoomId, chatRoomId }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentChatRoomRef = useRef<string | null>(null);
  const isEmbedded = Boolean(providedRoomId);
  // Fetch user's chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getChatRooms();
        const rooms = Array.isArray(response) ? response : (response.chatRooms || []);
        setChatRooms(rooms);
        
        // If a room id is provided (embedded mode), find and select that room
        if (providedRoomId) {
          const room = rooms.find((r: any) => r._id === providedRoomId || r.id === providedRoomId);
          if (room) {
            setSelectedChatRoom(room as any);
          }
        } else if (rooms.length > 0 && !selectedChatRoom) {
          // Otherwise select first chat room if available
          setSelectedChatRoom(rooms[0]);
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [providedRoomId]);

  // Fetch messages when chat room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatRoom?._id) return;
      
      try {
        const messagesData = await apiClient.getChatMessages(selectedChatRoom._id);
        setMessages(messagesData.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedChatRoom?._id]);

  // Socket.IO connection for real-time messages
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create Socket.IO connection
    const newSocket = io('http://localhost:5002', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected for chat');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    newSocket.on('new_message', (data) => {
      console.log('Received new message:', data);
      
      // Check if this message belongs to the current chat room
      if (data.message.chatRoomId === selectedChatRoom?._id) {
        console.log('Adding message to current chat');
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === data.message.id);
          if (exists) {
            console.log('Message already exists, not adding duplicate');
            return prev;
          }
          return [...prev, data.message];
        });
      }
    });

    newSocket.on('typing_start', (data) => {
      if (data.chatRoomId === selectedChatRoom?._id) {
        setIsTyping(prev => ({ ...prev, [data.userId]: true }));
      }
    });

    newSocket.on('typing_stop', (data) => {
      if (data.chatRoomId === selectedChatRoom?._id) {
        setIsTyping(prev => ({ ...prev, [data.userId]: false }));
      }
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
  }, [selectedChatRoom?._id]);

  // Join chat room when selected
  useEffect(() => {
    if (socket && selectedChatRoom?._id) {
      console.log('Attempting to join chat room:', selectedChatRoom._id);
      
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
  }, [selectedChatRoom?._id, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = () => {
    if (!socket || !selectedChatRoom?._id) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing start
    socket.emit('typing_start', { roomId: selectedChatRoom._id });

    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      socket.emit('typing_stop', { roomId: selectedChatRoom._id });
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !socket || !selectedChatRoom?._id) return;

    try {
      // Send message via Socket.IO
      socket.emit('send_message', {
        chatRoomId: selectedChatRoom._id,
        content: message.trim(),
        messageType: 'text'
      });
      
      // Clear input immediately
      setMessage('');
      
      // Stop typing
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socket.emit('typing_stop', { roomId: selectedChatRoom._id });
      
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleChatRoomClick = (chatRoomId: string) => {
    const room = chatRooms.find(r => r._id === chatRoomId);
    if (room) {
      setSelectedChatRoom(room);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getServiceTypeLabel = () => {
    if (!selectedChatRoom) return '';
    
    switch (selectedChatRoom.bookingType) {
      case 'moving': return 'Moving Service';
      case 'disposal': return 'Disposal Service';
      case 'transport': return 'Transport Service';
      default: return selectedChatRoom.bookingType;
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

  return (
    <div className="flex h-[600px] bg-background rounded-lg shadow">
      {/* Chat Rooms List */}
      {!isEmbedded && (
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Your Chats</h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {chatRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleChatRoomClick(room._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChatRoom?._id === room._id
                      ? 'bg-accent border border-accent'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {room.bookingType} #{room.bookingId}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {room.chatType}
                      </p>
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
      )}

      {/* Chat Area */}
      {selectedChatRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold">
                  {getServiceTypeLabel()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Booking #{selectedChatRoom.bookingId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={selectedChatRoom.isActive ? "default" : "secondary"}>
                {selectedChatRoom.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">
                    Start the conversation by sending a message
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    let lastDate: string | null = null;
                    return messages.map((m, index) => {
                      const dateStr = new Date(m.createdAt).toDateString();
                      const showDay = dateStr !== lastDate;
                      lastDate = dateStr;
                      const isOwn = m.senderType === 'user';
                      return (
                        <div key={m.id || `message-${index}`} className="space-y-2">
                          {showDay && (
                            <div className="flex justify-center">
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {!isOwn && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>CM</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border border-border'}`}>
                              <p className="text-sm break-words">{m.content}</p>
                              <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                                <span>{formatTime(m.createdAt)}</span>
                                {isOwn && (m.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              )}
              {/* Typing indicator */}
              {Object.values(isTyping).some(Boolean) && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                    <p className="text-sm">Someone is typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                ref={inputRef as any}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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

export default Chat; 