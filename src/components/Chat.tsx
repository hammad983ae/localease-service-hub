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
  Smile,
  DollarSign,
  ThumbsUp,
  MoreHorizontal,
  X
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
      chatType
      adminId
    }
  }
`;

const GET_MOVING_BOOKING = gql`
  query GetMovingBooking($bookingId: ID!) {
    bookingById(id: $bookingId) {
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
  }
`;

const GET_DISPOSAL_BOOKING = gql`
  query GetDisposalBooking($bookingId: ID!) {
    disposalBookingById(id: $bookingId) {
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
  }
`;

const GET_TRANSPORT_BOOKING = gql`
  query GetTransportBooking($bookingId: ID!) {
    transportBookingById(id: $bookingId) {
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

const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      email
      full_name
      phone
      address
      role
    }
    userProfile(userId: $userId) {
      id
      userId
      full_name
      phone
      address
      createdAt
    }
  }
`;

const GET_COMPANY_PROFILE = gql`
  query GetCompanyProfile($companyId: ID!) {
    company(id: $companyId) {
      id
      name
      email
      phone
      address
      description
      services
      priceRange
      companyType
      userId
      createdAt
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
      quote {
        id
        amount
        currency
        status
        counterOffer
        createdAt
      }
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

const GENERATE_QUOTE_DOCUMENT = gql`
  mutation GenerateQuoteDocument($bookingId: ID!, $finalAmount: Float!, $currency: String!) {
    generateQuoteDocument(bookingId: $bookingId, finalAmount: $finalAmount, currency: $currency) {
      id
      bookingId
      amount
      currency
      status
      documentUrl
      createdAt
    }
  }
`;

const GENERATE_INVOICE = gql`
  mutation GenerateInvoice($bookingId: ID!, $companyId: ID!, $amount: Float!) {
    generateInvoice(bookingId: $bookingId, companyId: $companyId, amount: $amount) {
      id
      bookingId
      amount
      currency
      status
      documentUrl
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
      quote {
        id
        amount
        currency
        status
        counterOffer
        createdAt
      }
    }
  }
`;

const SEND_QUOTE = gql`
  mutation SendQuote($chatRoomId: ID!, $amount: Float!, $currency: String!) {
    sendQuote(chatRoomId: $chatRoomId, amount: $amount, currency: $currency) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
      quote {
        id
        amount
        currency
        status
        counterOffer
        createdAt
      }
    }
  }
`;

const RESPOND_TO_QUOTE = gql`
  mutation RespondToQuote($quoteId: ID!, $response: String!, $counterOffer: Float) {
    respondToQuote(quoteId: $quoteId, response: $response, counterOffer: $counterOffer) {
      id
      content
      senderType
      senderId
      messageType
      isRead
      createdAt
      quote {
        id
        amount
        currency
        status
        counterOffer
        createdAt
      }
    }
  }
`;

interface ChatProps {
  chatRoomId: string;
  onClose?: () => void;
}

interface Quote {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOffer?: number;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  senderType: 'user' | 'company' | 'admin';
  senderId: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  quote?: Quote;
}

const Chat: React.FC<ChatProps> = ({ chatRoomId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markAsRead } = useNotifications();
  const client = useApolloClient();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBookingInfo, setShowBookingInfo] = useState(false);
  const [showQuoteInput, setShowQuoteInput] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [counterOffer, setCounterOffer] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [respondingToCompany, setRespondingToCompany] = useState<string | null>(null);
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

  // Get booking info based on type
  const { data: movingBookingData, error: movingBookingError } = useQuery(GET_MOVING_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId || '' },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'moving',
  });

  const { data: disposalBookingData, error: disposalBookingError } = useQuery(GET_DISPOSAL_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId || '' },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'disposal',
  });

  const { data: transportBookingData, error: transportBookingError } = useQuery(GET_TRANSPORT_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId || '' },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'transport',
  });

  const booking = movingBookingData?.bookingById || disposalBookingData?.disposalBookingById;

  // Get user profile
  const { data: userProfileData, error: userProfileError } = useQuery(GET_USER_PROFILE, {
    variables: { userId: chatRoom?.userId || '' },
    skip: !chatRoom?.userId,
  });

  // Get company profile
  const { data: companyProfileData, error: companyProfileError } = useQuery(GET_COMPANY_PROFILE, {
    variables: { companyId: chatRoom?.companyId || '' },
    skip: !chatRoom?.companyId,
  });

  const userProfile = userProfileData?.userProfile;
  const userData = userProfileData?.user;
  const companyProfile = companyProfileData?.company;

  // Check if this is an admin chat
  const isAdminChat = chatRoom?.chatType === 'admin_user';

  // Debug logging
  console.log('Chat Debug Data:', {
    chatRoom,
    userProfileData,
    companyProfileData,
    userProfile,
    userData,
    companyProfile,
    booking,
    userProfileError,
    companyProfileError,
    movingBookingData,
    disposalBookingData,
    transportBookingData
  });

  // Show error messages if queries fail
  if (userProfileError) {
    console.error('User profile error:', userProfileError);
  }
  if (companyProfileError) {
    console.error('Company profile error:', companyProfileError);
  }
  if (movingBookingError) {
    console.error('Moving booking error:', movingBookingError);
  }
  if (disposalBookingError) {
    console.error('Disposal booking error:', disposalBookingError);
  }
  if (transportBookingError) {
    console.error('Transport booking error:', transportBookingError);
  }

  const { data, loading, error, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatRoomId },
    fetchPolicy: 'cache-and-network',
  });

  // Real-time subscription for new messages with better error handling
  const { data: subscriptionData, error: subscriptionError } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId },
    skip: !chatRoomId,
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Subscription error:', error);
      toast({
        title: "Connection Error",
        description: "Real-time updates may not work. Messages will still be sent.",
        variant: "destructive",
      });
    },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessageAsRead] = useMutation(MARK_MESSAGE_AS_READ);
  const [sendQuote] = useMutation(SEND_QUOTE);
  const [respondToQuote] = useMutation(RESPOND_TO_QUOTE);
  const [generateQuoteDocument] = useMutation(GENERATE_QUOTE_DOCUMENT);
  const [generateInvoice] = useMutation(GENERATE_INVOICE);

  const messages = data?.chatMessages || [];
  
  // Handle subscription data with better logic
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      const newMessage = subscriptionData.messageAdded;
      console.log('New message received via subscription:', newMessage);
      
      // Check if message is not already in the list
      const existingMessage = messages.find(msg => msg.id === newMessage.id);
      if (!existingMessage) {
        // Update the cache with the new message
        client.cache.modify({
          id: client.cache.identify({ __typename: 'Query' }),
          fields: {
            chatMessages(existingMessages = []) {
              const newMessages = [...existingMessages, newMessage];
              // Sort by createdAt to maintain order
              return newMessages.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            },
          },
        });
        
        // Show notification for new message (if not from current user)
        if (newMessage.senderId !== user?.id) {
          toast({
            title: "New Message",
            description: "You received a new message",
            duration: 3000,
          });
        }
      }
    }
  }, [subscriptionData, client.cache, messages, user]);

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      toast({
        title: "Connection Warning",
        description: "Real-time updates may not work. Messages will still be sent.",
        variant: "destructive",
      });
    }
  }, [subscriptionError, toast]);

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

  const handleCompanyResponse = async (response: 'yes' | 'more') => {
    if (!respondingToCompany) return;
    
    setIsSending(true);
    try {
      let messageContent = '';
      
      if (response === 'yes') {
        messageContent = '✅ YES - I would like to proceed with this company. Please generate an invoice.';
        
        // Generate invoice for the booking
        try {
          // Extract company ID from the message content (you might need to adjust this based on your data structure)
          const chatRoom = await client.query({
            query: gql`
              query GetChatRoom($chatRoomId: ID!) {
                chatRoom(id: $chatRoomId) {
                  id
                  bookingId
                  bookingType
                }
              }
            `,
            variables: { chatRoomId }
          });
          
          if (chatRoom.data?.chatRoom?.bookingId) {
            await generateInvoice({
              variables: {
                bookingId: chatRoom.data.chatRoom.bookingId,
                companyId: 'temp-company-id', // You'll need to extract this from the company message
                amount: 0 // You'll need to determine the amount
              }
            });
          }
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
          // Continue with the message even if invoice generation fails
        }
      } else {
        messageContent = '🔄 More Options - Please show me other companies or alternatives.';
      }
      
      await sendMessage({
        variables: {
          chatRoomId,
          content: messageContent,
          messageType: 'text'
        }
      });
      
      setRespondingToCompany(null);
      
      // If user said YES, show success message
      if (response === 'yes') {
        toast({
          title: 'Invoice Request',
          description: 'Your invoice request has been sent to the admin.',
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quoteAmount.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendQuote({
        variables: {
          chatRoomId,
          amount: parseFloat(quoteAmount),
          currency: 'USD'
        }
      });
      setQuoteAmount('');
      setShowQuoteInput(false);
      refetch();
      toast({
        title: "Quote sent",
        description: `Quote of $${quoteAmount} sent successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending quote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuoteResponse = async (quoteId: string, response: 'accept' | 'reject' | 'counter', counterAmount?: number) => {
    setIsSending(true);
    try {
      await respondToQuote({
        variables: {
          quoteId,
          response,
          counterOffer: counterAmount
        }
      });
      
      if (response === 'accept') {
        // Find the quote to get the correct amount
        const quoteMessage = messages.find(msg => 
          msg.quote && msg.quote.id === quoteId
        );
        
        if (quoteMessage?.quote) {
          // Generate quote document
          await generateQuoteDocument({
            variables: {
              bookingId: chatRoom?.bookingId || '',
              finalAmount: quoteMessage.quote.amount,
              currency: quoteMessage.quote.currency
            }
          });
          
          toast({
            title: "Quote accepted!",
            description: "Quote document has been generated and saved.",
          });
        }
      }
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error responding to quote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
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

  const isCompanyRecommendation = (message: Message) => {
    const isCompany = message.senderType === 'admin' && 
           message.content.includes('🏢') && 
           message.content.includes('**') && 
           (message.content.includes('Email:') || message.content.includes('Phone:'));
    
    // Debug logging
    if (message.senderType === 'admin') {
      console.log('Admin message detected:', {
        messageId: message.id,
        hasEmoji: message.content.includes('🏢'),
        hasBold: message.content.includes('**'),
        hasEmail: message.content.includes('Email:'),
        hasPhone: message.content.includes('Phone:'),
        isCompany: isCompany
      });
    }
    
    return isCompany;
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
                    {isAdminChat 
                      ? 'Admin Support' 
                      : user?.role === 'company' 
                        ? `${userData?.full_name || userProfile?.full_name || 'Customer'}` 
                        : `${companyProfile?.name || 'Service Provider'}`
                    } • {booking?.status || 'Unknown Status'}
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
                className="gap-2"
              >
                <User className="h-4 w-4" />
                {showBookingInfo ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Profile Information Panel */}
      {showBookingInfo && (
        <Card className="mb-4 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Profile Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-700">
                      {user?.role === 'company' ? 'Customer Profile' : 'My Profile'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm font-medium truncate">{userData?.email || userProfile?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <User className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Name</p>
                        <p className="text-sm font-medium truncate">{userData?.full_name || userProfile?.full_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-medium truncate">{userData?.phone || userProfile?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                      <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm font-medium">{userData?.address || userProfile?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Profile Section */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-700">
                      {user?.role === 'company' ? 'My Company' : 'Service Provider'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Company</p>
                        <p className="text-sm font-medium truncate">{companyProfile?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Mail className="h-4 w-4 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm font-medium truncate">{companyProfile?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Phone className="h-4 w-4 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-medium truncate">{companyProfile?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                      <MapPin className="h-4 w-4 text-green-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm font-medium">{companyProfile?.address || 'N/A'}</p>
                      </div>
                    </div>
                    {companyProfile?.description && (
                      <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                        <MessageCircle className="h-4 w-4 text-green-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Description</p>
                          <p className="text-sm font-medium">{companyProfile.description}</p>
                        </div>
                      </div>
                    )}
                    {companyProfile?.services && companyProfile.services.length > 0 && (
                      <div className="p-2 bg-white rounded-md">
                        <p className="text-xs text-gray-500 font-medium mb-2">Services</p>
                        <div className="flex flex-wrap gap-1">
                          {companyProfile.services.map((service: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-700">Service Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Date</p>
                        <p className="text-sm font-medium">
                          {booking?.dateTime ? formatDate(booking.dateTime) :
                         booking?.dateTimeFlexible ? 'Flexible' : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {booking?.addresses && (
                      <>
                        <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                          <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">From</p>
                            <p className="text-sm font-medium">{booking.addresses.from || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                          <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">To</p>
                            <p className="text-sm font-medium">{booking.addresses.to || 'N/A'}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {booking?.pickupAddress && (
                      <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                        <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Pickup</p>
                          <p className="text-sm font-medium">{booking.pickupAddress.fullAddress || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                    {booking?.pickupLocation && booking?.dropoffLocation && (
                      <>
                        <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                          <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Pickup</p>
                            <p className="text-sm font-medium">{booking.pickupLocation.fullAddress || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                          <MapPin className="h-4 w-4 text-purple-500 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Dropoff</p>
                            <p className="text-sm font-medium">{booking.dropoffLocation.fullAddress || 'N/A'}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {booking?.contact?.notes && (
                      <div className="flex items-start gap-3 p-2 bg-white rounded-md">
                        <MessageCircle className="h-4 w-4 text-purple-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Notes</p>
                          <p className="text-sm font-medium">{booking.contact.notes}</p>
                        </div>
                      </div>
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
                            
                            {/* Company Recommendation Response Buttons */}
                            {message.senderType === 'admin' && isCompanyRecommendation(message) && !respondingToCompany && (
                              <div className="flex space-x-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => setRespondingToCompany(message.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>YES</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRespondingToCompany(message.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                  <span>More Options</span>
                                </Button>
                              </div>
                            )}
                            
                            {/* Response Buttons when responding */}
                            {respondingToCompany === message.id && (
                              <div className="flex space-x-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleCompanyResponse('yes')}
                                  disabled={isSending}
                                  className="flex items-center space-x-1"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>YES</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompanyResponse('more')}
                                  disabled={isSending}
                                  className="flex items-center space-x-1"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                  <span>More Options</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRespondingToCompany(null)}
                                  disabled={isSending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {/* Quote Display */}
                            {message.quote && message.messageType === 'quote' && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">
                                    Quote: ${message.quote.amount}
                                  </span>
                                </div>
                                
                                {/* Quote Response Buttons */}
                                {message.quote.status === 'pending' && !isOwnMessage && (
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (message.quote && message.quote.status === 'pending') {
                                          handleQuoteResponse(message.quote.id, 'accept');
                                        }
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      disabled={isSending || message.quote?.status !== 'pending'}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (message.quote && message.quote.status === 'pending') {
                                          handleQuoteResponse(message.quote.id, 'reject');
                                        }
                                      }}
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                      disabled={isSending || message.quote?.status !== 'pending'}
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (message.quote && message.quote.status === 'pending') {
                                          const counterAmount = prompt('Enter your counter offer amount:');
                                          if (counterAmount) {
                                            handleQuoteResponse(message.quote.id, 'counter', parseFloat(counterAmount));
                                          }
                                        }
                                      }}
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                      disabled={isSending || message.quote?.status !== 'pending'}
                                    >
                                      Counter Offer
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Quote Status */}
                                {message.quote.status !== 'pending' && (
                                  <div className="mt-2">
                                    <Badge 
                                      variant={message.quote.status === 'accepted' ? 'default' : 'secondary'}
                                      className={message.quote.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                                    >
                                      {message.quote.status === 'accepted' ? 'Accepted' : 
                                       message.quote.status === 'rejected' ? 'Rejected' : 
                                       message.quote.status === 'countered' ? 'Countered' : 'Pending'}
                                    </Badge>
                                    {message.quote.counterOffer && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        Counter: ${message.quote.counterOffer}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
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
            {/* Quote Input for Companies */}
            {user?.role === 'company' && !showQuoteInput && (
              <div className="mb-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQuoteInput(true)}
                  className="w-full gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <DollarSign className="h-4 w-4" />
                  Send Quote
                </Button>
              </div>
            )}

            {/* Quote Input Form */}
            {showQuoteInput && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Send Quote</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleSendQuote}
                    disabled={!quoteAmount.trim() || isSending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuoteInput(false);
                      setQuoteAmount('');
                    }}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

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