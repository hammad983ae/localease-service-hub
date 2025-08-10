import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';

const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatRoomId: ID!) {
    chatMessages(chatRoomId: $chatRoomId) {
      id
      content
      senderId
      senderType
      createdAt
      isRead
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: ID!, $content: String!) {
    sendMessage(chatRoomId: $chatRoomId, content: $content) {
      id
      content
      senderId
      senderType
      createdAt
      isRead
    }
  }
`;

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

const GET_CHAT_ROOM_DETAILS = gql`
  query GetChatRoomDetails($chatRoomId: ID!) {
    chatRoom(id: $chatRoomId) {
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

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'user' | 'company' | 'admin';
  createdAt: string;
  isRead: boolean;
}

interface ChatProps {
  chatRoomId: string;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ chatRoomId, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: chatRoomData } = useQuery(GET_CHAT_ROOM_DETAILS, {
    variables: { chatRoomId },
  });

  const { data: messagesData, loading: messagesLoading, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatRoomId },
    fetchPolicy: 'network-only',
  });

  // Real-time subscription for new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId },
    skip: !chatRoomId,
    onData: ({ data }) => {
      if (data?.data?.messageAdded) {
        console.log('New message received via subscription:', data.data.messageAdded);
        // Refetch messages to get the updated list
        refetch();
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      console.log('Message sent successfully:', data);
      setMessage('');
      // Don't need to refetch here as subscription will handle it
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

    const messages = messagesData?.chatMessages || [];
  const chatRoom = chatRoomData?.chatRoom;
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle new messages from subscription
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      console.log('Processing new message from subscription');
      refetch();
    }
  }, [subscriptionData, refetch]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({
        variables: {
          chatRoomId,
          content: message.trim(),
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.id;
  };

  const getSenderInfo = (message: Message) => {
    switch (message.senderType) {
      case 'user':
        return { name: 'You', icon: User, color: 'bg-blue-500' };
      case 'company':
        return { name: 'Service Provider', icon: Building2, color: 'bg-green-500' };
      case 'admin':
        return { name: 'Support Team', icon: MessageCircle, color: 'bg-purple-500' };
      default:
        return { name: 'Unknown', icon: User, color: 'bg-gray-500' };
    }
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'moving': return 'Moving Service';
      case 'disposal': return 'Disposal Service';
      case 'transport': return 'Transport Service';
      default: return type;
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Clean Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-500 text-white">
              {chatRoom?.chatType === 'admin_user' ? (
                <MessageCircle className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {chatRoom?.chatType === 'admin_user' 
                ? 'Support Chat' 
                : getBookingTypeLabel(chatRoom?.bookingType || '')}
            </h3>
            <p className="text-sm text-gray-500">
              Booking #{chatRoom?.bookingId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: Message) => {
              const senderInfo = getSenderInfo(msg);
              const isOwn = isOwnMessage(msg);
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className={`text-white text-xs ${senderInfo.color}`}>
                          <senderInfo.icon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`space-y-1 ${isOwn ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl px-4 py-2 max-w-full ${
                        isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isOwn && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Clean Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 