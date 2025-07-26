import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  MessageCircle, 
  User, 
  Building2, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

const GET_CHAT_ROOM_INFO = gql`
  query GetChatRoomInfo($chatRoomId: ID!) {
    chatRoom(id: $chatRoomId) {
      id
      bookingId
      bookingType
      userId
      companyId
      isActive
      createdAt
    }
  }
`;

const GET_BOOKING_INFO = gql`
  query GetBookingInfo($bookingId: ID!, $bookingType: String!) {
    booking(id: $bookingId) @include(if: $isMoving) {
      id
      status
      dateTime
      dateTimeFlexible
      addresses { from to }
      contact { name email phone notes }
      rooms { room floor count }
      items
      company { name email phone address }
    }
    disposalBooking(id: $bookingId) @include(if: $isDisposal) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupAddress { fullAddress }
      contact { name email phone notes }
      items { type description quantity }
      company { name email phone address }
    }
    transportBooking(id: $bookingId) @include(if: $isTransport) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupLocation { fullAddress }
      dropoffLocation { fullAddress }
      contact { name email phone notes }
      items { type description quantity }
      company { name email phone address }
    }
  }
`;

const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatRoomId: ID!) {
    chatMessages(chatRoomId: $chatRoomId) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: ID!, $content: String!, $messageType: String) {
    sendMessage(chatRoomId: $chatRoomId, content: $content, messageType: $messageType) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

const MARK_MESSAGE_AS_READ = gql`
  mutation MarkMessageAsRead($messageId: ID!) {
    markMessageAsRead(messageId: $messageId) {
      id
      isRead
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
    }
  }
`;

interface ChatProps {
  chatRoomId: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  content: string;
  senderType: 'user' | 'company';
  senderId: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

const Chat: React.FC<ChatProps> = ({ chatRoomId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markAsRead } = useNotifications();
  const client = useApolloClient();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBookingInfo, setShowBookingInfo] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat room info
  const { data: chatRoomData } = useQuery(GET_CHAT_ROOM_INFO, {
    variables: { chatRoomId },
  });

  const chatRoom = chatRoomData?.chatRoom;
  const isMoving = chatRoom?.bookingType === 'moving';
  const isDisposal = chatRoom?.bookingType === 'disposal';
  const isTransport = chatRoom?.bookingType === 'transport';

  // Get booking info
  const { data: bookingData } = useQuery(GET_BOOKING_INFO, {
    variables: { 
      bookingId: chatRoom?.bookingId || '',
      bookingType: chatRoom?.bookingType || '',
      isMoving,
      isDisposal,
      isTransport
    },
    skip: !chatRoom?.bookingId,
  });

  const booking = bookingData?.booking || bookingData?.disposalBooking || bookingData?.transportBooking;

  const { data, loading, error, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatRoomId },
  });

  // Real-time subscription for new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId },
    skip: !chatRoomId,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessageAsRead] = useMutation(MARK_MESSAGE_AS_READ);

  const messages = data?.chatMessages || [];
  
  // Add new messages from subscription to the list
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      const newMessage = subscriptionData.messageAdded;
      console.log('Chat received new message:', newMessage);
      // Check if message is not already in the list
      if (!messages.find(msg => msg.id === newMessage.id)) {
        // Update the cache with the new message
        client.cache.modify({
          fields: {
            chatMessages(existingMessages = []) {
              return [...existingMessages, newMessage];
            },
          },
        });
      }
    }
  }, [subscriptionData, messages, client.cache]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they're received
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(
        (msg: Message) => 
          !msg.isRead && 
          msg.senderId !== user.id
      );
      
      unreadMessages.forEach((message: Message) => {
        markMessageAsRead({ variables: { messageId: message.id } }).catch(console.error);
      });
      
      // Mark chat as read in notifications
      if (unreadMessages.length > 0) {
        markAsRead(chatRoomId);
      }
    }
  }, [messages, user, markMessageAsRead, markAsRead, chatRoomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        variables: {
          chatRoomId,
          content: newMessage.trim(),
          messageType: 'text'
        }
      });
      setNewMessage('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getServiceTypeLabel = () => {
    switch (chatRoom?.bookingType) {
      case 'moving': return 'Moving Service';
      case 'disposal': return 'Disposal Service';
      case 'transport': return 'Transport Service';
      default: return 'Service';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Loading Chat...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error loading messages: {error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Enhanced Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-gradient-to-r from-primary to-blue-600">
                  <AvatarFallback className="text-white">
                    {user?.role === 'company' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{getServiceTypeLabel()}</h2>
                  <p className="text-sm text-muted-foreground">
                    {booking?.contact?.name || 'Customer'} • {booking?.status || 'Unknown Status'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getBookingStatusColor(booking?.status || '')}>
                {booking?.status || 'Unknown'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBookingInfo(!showBookingInfo)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Booking Information Panel */}
      {showBookingInfo && booking && (
        <Card className="mb-4 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{booking.contact?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{booking.contact?.phone || 'N/A'}</span>
                    </div>
                    {booking.contact?.notes && (
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="font-medium">Notes:</span>
                        <span className="text-muted-foreground">{booking.contact.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Service Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date:</span>
                      <span>
                        {booking.dateTime ? formatDate(booking.dateTime) : 
                         booking.dateTimeFlexible ? 'Flexible' : 'N/A'}
                      </span>
                    </div>
                    {booking.addresses && (
                      <>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="font-medium">From:</span>
                          <span className="text-muted-foreground">{booking.addresses.from || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="font-medium">To:</span>
                          <span className="text-muted-foreground">{booking.addresses.to || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    {booking.pickupAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="font-medium">Pickup:</span>
                        <span className="text-muted-foreground">{booking.pickupAddress.fullAddress || 'N/A'}</span>
                      </div>
                    )}
                    {booking.pickupLocation && booking.dropoffLocation && (
                      <>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="font-medium">Pickup:</span>
                          <span className="text-muted-foreground">{booking.pickupLocation.fullAddress || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="font-medium">Dropoff:</span>
                          <span className="text-muted-foreground">{booking.dropoffLocation.fullAddress || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-96">
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">Start the conversation by sending a message!</p>
                </div>
              ) : (
                messages.map((message: Message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const isCompany = message.senderType === 'company';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback className={`text-xs ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {isCompany ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl px-4 py-3 max-w-full ${
                            isOwnMessage 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                              <Badge variant="secondary" className="text-xs">
                                {message.isRead ? 'Read' : 'Sent'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Enhanced Message Input */}
          <div className="p-4">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isSending}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat; 