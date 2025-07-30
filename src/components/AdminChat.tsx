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
import { gql, useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { useToast } from '@/hooks/use-toast';

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

const TEST_AUTH_QUERY = gql`
  query TestAuth {
    me {
      id
      email
      role
    }
  }
`;

const GET_CHAT_ROOM_INFO = gql`
  query GetChatRoomInfo($chatRoomId: ID!) {
    chatRoom(id: $chatRoomId) {
      id
      bookingId
      bookingType
      userId
      adminId
      chatType
      isActive
      createdAt
    }
  }
`;

const GET_MOVING_BOOKING = gql`
  query GetMovingBooking($bookingId: ID!) {
    booking(id: $bookingId) {
      id
      status
      dateTime
      dateTimeFlexible
      addresses { from to }
      contact { name email phone notes }
      rooms { room floor count }
      items
    }
  }
`;

const GET_DISPOSAL_BOOKING = gql`
  query GetDisposalBooking($bookingId: ID!) {
    disposalBooking(id: $bookingId) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupAddress { fullAddress }
      contact { name email phone notes }
      items { type description quantity }
    }
  }
`;

const GET_TRANSPORT_BOOKING = gql`
  query GetTransportBooking($bookingId: ID!) {
    transportBooking(id: $bookingId) {
      id
      status
      serviceType
      dateTime
      dateTimeFlexible
      pickupLocation { fullAddress }
      dropoffLocation { fullAddress }
      contact { name email phone notes }
      items { type description quantity }
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

const SEND_ADMIN_MESSAGE = gql`
  mutation SendAdminMessage($chatRoomId: ID!, $content: String!, $messageType: String) {
    sendAdminMessage(chatRoomId: $chatRoomId, content: $content, messageType: $messageType) {
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

const CREATE_INVOICE = gql`
  mutation CreateInvoice($bookingId: ID!, $companyId: ID!, $amount: Float!) {
    createInvoice(bookingId: $bookingId, companyId: $companyId, amount: $amount) {
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

const GET_COMPANIES = gql`
  query GetCompanies {
    allCompanies {
      id
      name
      email
      phone
      address
      description
      services
      priceRange
      companyType
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($chatRoomId: ID!) {
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

interface AdminChatProps {
  onClose?: () => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const client = useApolloClient();
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [selectedCompanyForInvoice, setSelectedCompanyForInvoice] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug user authentication
  console.log('AdminChat - User:', user);
  console.log('AdminChat - User role:', user?.role);
  console.log('AdminChat - User ID:', user?.id);
  console.log('AdminChat - Token:', localStorage.getItem('token'));

  // Test if user is admin
  if (user && user.role !== 'admin') {
    console.error('User is not admin! Role:', user.role);
  }

  // Get admin chat rooms
  const { data: chatRoomsData, loading: chatRoomsLoading, error: chatRoomsError } = useQuery(GET_ADMIN_CHAT_ROOMS, {
    skip: !user || user?.role !== 'admin',
    errorPolicy: 'all',
  });

  // Test authentication
  const { data: authData, loading: authLoading, error: authError } = useQuery(TEST_AUTH_QUERY, {
    errorPolicy: 'all',
  });

  console.log('Auth test result:', { authData, authError, authLoading });

  const chatRooms = chatRoomsData?.adminChatRooms || [];

  // Handle GraphQL errors
  if (chatRoomsError) {
    console.error('Error fetching admin chat rooms:', chatRoomsError);
  }

  // Check if user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">You need admin privileges to access this feature.</p>
      </div>
    );
  }

  // Get selected chat room info
  const { data: chatRoomData, error: chatRoomError } = useQuery(GET_CHAT_ROOM_INFO, {
    variables: { chatRoomId: selectedChatRoom || '' },
    skip: !selectedChatRoom,
    errorPolicy: 'all',
  });

  const chatRoom = chatRoomData?.chatRoom;
  const isMoving = chatRoom?.bookingType === 'moving';
  const isDisposal = chatRoom?.bookingType === 'disposal';
  const isTransport = chatRoom?.bookingType === 'transport';

  // Get booking details based on type
  const { data: movingBookingData, loading: movingBookingLoading, error: movingBookingError } = useQuery(GET_MOVING_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'moving',
    errorPolicy: 'all',
  });

  const { data: disposalBookingData, loading: disposalBookingLoading, error: disposalBookingError } = useQuery(GET_DISPOSAL_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'disposal',
    errorPolicy: 'all',
  });

  const { data: transportBookingData, loading: transportBookingLoading, error: transportBookingError } = useQuery(GET_TRANSPORT_BOOKING, {
    variables: { bookingId: chatRoom?.bookingId },
    skip: !chatRoom?.bookingId || chatRoom?.bookingType !== 'transport',
    errorPolicy: 'all',
  });

  // Debug booking data
  console.log('AdminChat - Chat Room:', chatRoom);
  console.log('AdminChat - Moving Booking Data:', movingBookingData);
  console.log('AdminChat - Disposal Booking Data:', disposalBookingData);
  console.log('AdminChat - Transport Booking Data:', transportBookingData);

  const booking = movingBookingData?.booking || disposalBookingData?.disposalBooking || transportBookingData?.transportBooking || null;

  // Debug logging
  if (chatRoom?.bookingId) {
    console.log('Booking query variables:', { 
      bookingId: chatRoom.bookingId, 
      bookingType: chatRoom.bookingType 
    });
    console.log('Moving booking data:', movingBookingData);
    console.log('Disposal booking data:', disposalBookingData);
    console.log('Transport booking data:', transportBookingData);
    console.log('Selected booking:', booking);
  }

  // Get user profile
  const { data: userProfileData, error: userProfileError } = useQuery(GET_USER_PROFILE, {
    variables: { userId: chatRoom?.userId || '' },
    skip: !chatRoom?.userId,
    errorPolicy: 'all',
  });

  const userProfile = userProfileData?.userProfile;
  const userData = userProfileData?.user;

  // Get chat messages
  const { data: messagesData, loading: messagesLoading, refetch, error: messagesError } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatRoomId: selectedChatRoom || '' },
    skip: !selectedChatRoom,
    errorPolicy: 'all',
  });

  const messages = messagesData?.chatMessages || [];

  // Handle GraphQL errors
  if (chatRoomError) {
    console.error('Error fetching chat room info:', chatRoomError);
  }
  if (movingBookingError) {
    console.error('Error fetching moving booking details:', movingBookingError);
  }
  if (disposalBookingError) {
    console.error('Error fetching disposal booking details:', disposalBookingError);
  }
  if (transportBookingError) {
    console.error('Error fetching transport booking details:', transportBookingError);
  }
  if (userProfileError) {
    console.error('Error fetching user profile:', userProfileError);
  }
  if (messagesError) {
    console.error('Error fetching chat messages:', messagesError);
  }

  // Real-time subscription for new messages
  const { data: subscriptionData, error: subscriptionError } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId: selectedChatRoom || '' },
    skip: !selectedChatRoom,
    errorPolicy: 'all',
  });

  const [sendAdminMessage] = useMutation(SEND_ADMIN_MESSAGE);
  const [markMessageAsRead] = useMutation(MARK_MESSAGE_AS_READ);
  const [createInvoice] = useMutation(CREATE_INVOICE);

  // Get companies for admin selection
  const { data: companiesData } = useQuery(GET_COMPANIES, {
    errorPolicy: 'all',
  });

  const companies = companiesData?.allCompanies || [];

  // Handle invoice creation
  const handleCreateInvoice = async () => {
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Error',
        description: 'Only admins can create invoices',
        variant: 'destructive',
      });
      return;
    }

    if (!invoiceAmount || !selectedCompanyForInvoice || !chatRoom?.bookingId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating invoice with:', {
        bookingId: chatRoom.bookingId,
        companyId: selectedCompanyForInvoice,
        amount: invoiceAmount,
        user: user
      });

      // Test authentication first
      console.log('Testing authentication...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');

      // Check if user is properly authenticated
      if (authError) {
        console.error('Authentication error:', authError);
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive',
        });
        return;
      }

      if (!authData?.me) {
        console.error('No user data from auth query');
        toast({
          title: 'Authentication Error',
          description: 'User not found',
          variant: 'destructive',
        });
        return;
      }

      console.log('User authenticated:', authData.me);

      const amount = parseFloat(invoiceAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid amount',
          variant: 'destructive',
        });
        return;
      }

      // Get booking details for complete invoice data
      const booking = movingBookingData?.booking || disposalBookingData?.disposalBooking || transportBookingData?.transportBooking;
      const selectedCompanyData = companies.find(c => c.id === selectedCompanyForInvoice);
      
      if (!booking) {
        toast({
          title: 'Error',
          description: 'Booking details not found',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedCompanyData) {
        toast({
          title: 'Error',
          description: 'Company not found',
          variant: 'destructive',
        });
        return;
      }

      const result = await createInvoice({
        variables: {
          bookingId: chatRoom.bookingId,
          companyId: selectedCompanyForInvoice,
          amount: amount
        }
      });

      console.log('Invoice created successfully:', result);

      // Create comprehensive invoice message
      const invoiceMessage = `📄 **INVOICE CREATED**\n\n` +
        `💰 **Amount:** $${amount.toLocaleString()}\n` +
        `🏢 **Company:** ${selectedCompanyData.name}\n` +
        `📅 **Service Type:** ${chatRoom.bookingType}\n` +
        `📋 **Status:** Accepted\n\n` +
        `**Booking Details:**\n` +
        `${booking.contact ? `👤 **Contact:** ${booking.contact.name} (${booking.contact.email})\n` : ''}` +
        `${booking.addresses ? `📍 **From:** ${booking.addresses.from}\n📍 **To:** ${booking.addresses.to}\n` : ''}` +
        `${booking.pickupAddress ? `📍 **Pickup:** ${booking.pickupAddress.fullAddress}\n` : ''}` +
        `${booking.pickupLocation ? `📍 **Pickup:** ${booking.pickupLocation.fullAddress}\n📍 **Dropoff:** ${booking.dropoffLocation?.fullAddress}\n` : ''}` +
        `${booking.dateTime ? `📅 **Date:** ${new Date(booking.dateTime).toLocaleDateString()}\n` : ''}` +
        `${booking.dateTimeFlexible ? `⏰ **Flexible:** ${booking.dateTimeFlexible}\n` : ''}` +
        `\n✅ **Invoice is now available in your Quotes tab!**`;

      // Send the comprehensive invoice message
      await sendAdminMessage({
        variables: {
          chatRoomId: selectedChatRoom,
          content: invoiceMessage,
          messageType: 'text'
        }
      });

      setShowInvoiceForm(false);
      setInvoiceAmount('');
      setSelectedCompanyForInvoice('');

      toast({
        title: 'Success',
        description: 'Invoice created and sent successfully',
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      console.error('Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError
      });
      toast({
        title: 'Error',
        description: 'Failed to create invoice: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle GraphQL errors
  if (subscriptionError) {
    console.error('Error in message subscription:', subscriptionError);
  }

  // Handle new messages from subscription
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      refetch();
    }
  }, [subscriptionData, refetch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatRoomClick = (chatRoomId: string) => {
    setSelectedChatRoom(chatRoomId);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedChatRoom(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedCompany) return;
    
    setIsSending(true);
    try {
      let messageContent = newMessage;
      
      // If a company is selected, send company information
      if (selectedCompany) {
        const company = companies.find(c => c.id === selectedCompany);
        if (company) {
          messageContent = `🏢 **${company.name}**\n\n📧 Email: ${company.email}\n📞 Phone: ${company.phone}\n📍 Address: ${company.address}\n💰 Price Range: ${company.priceRange}\n📋 Services: ${company.services?.join(', ') || 'N/A'}\n\n${newMessage}`;
        }
      }
      
      await sendAdminMessage({
        variables: {
          chatRoomId: selectedChatRoom,
          content: messageContent,
          messageType: 'text'
        }
      });
      
      setNewMessage('');
      setSelectedCompany('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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

  if (showChat && selectedChatRoom) {
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
                  <Avatar className="h-10 w-10 bg-gradient-to-r from-green-600 to-blue-600">
                    <AvatarFallback className="text-white">
                      <Shield className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{getServiceTypeLabel()}</h2>
                    <p className="text-sm text-muted-foreground">
                      {userData?.full_name || userProfile?.full_name || 'Customer'} • {booking?.status || 'Unknown Status'}
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
                  onClick={handleCloseChat}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Close Chat
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold">
                  {userProfile?.full_name || userData?.full_name || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userData?.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">
              {getServiceTypeLabel()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Booking Details Button */}
            <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Booking Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                </DialogHeader>
                {booking && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Service Type</h4>
                        <p className="text-sm">{getServiceTypeLabel()}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Status</h4>
                        <Badge variant="secondary">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {booking.dateTime && (
                      <div>
                        <h4 className="font-semibold mb-2">Date & Time</h4>
                        <p className="text-sm">{formatDate(booking.dateTime)} at {formatTime(booking.dateTime)}</p>
                        {booking.dateTimeFlexible && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Flexible: {booking.dateTimeFlexible}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {booking.contact && (
                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Name:</strong> {booking.contact.name}</p>
                          <p><strong>Email:</strong> {booking.contact.email}</p>
                          <p><strong>Phone:</strong> {booking.contact.phone}</p>
                          {booking.contact.notes && (
                            <p><strong>Notes:</strong> {booking.contact.notes}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Moving Booking Details */}
                    {booking.addresses && (
                      <div>
                        <h4 className="font-semibold mb-2">Addresses</h4>
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>From:</strong> {booking.addresses.from}
                          </div>
                          <div>
                            <strong>To:</strong> {booking.addresses.to}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Disposal/Transport Booking Details */}
                    {booking.pickupAddress && (
                      <div>
                        <h4 className="font-semibold mb-2">Pickup Address</h4>
                        <p className="text-sm">{booking.pickupAddress.fullAddress}</p>
                      </div>
                    )}
                    
                    {booking.pickupLocation && (
                      <div>
                        <h4 className="font-semibold mb-2">Pickup Location</h4>
                        <p className="text-sm">{booking.pickupLocation.fullAddress}</p>
                      </div>
                    )}
                    
                    {booking.dropoffLocation && (
                      <div>
                        <h4 className="font-semibold mb-2">Dropoff Location</h4>
                        <p className="text-sm">{booking.dropoffLocation.fullAddress}</p>
                      </div>
                    )}
                    
                    {/* Rooms (Moving) */}
                    {booking.rooms && booking.rooms.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Rooms</h4>
                        <div className="text-sm space-y-1">
                          {booking.rooms.map((room: any, index: number) => (
                            <div key={index}>
                              <strong>Floor {room.floor}:</strong> {room.room} ({room.count} items)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Items */}
                    {booking.items && (
                      <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <div className="text-sm">
                          {Array.isArray(booking.items) ? (
                            <div className="space-y-1">
                              {booking.items.map((item: any, index: number) => (
                                <div key={index}>
                                  <strong>{item.type}:</strong> {item.description} (Qty: {item.quantity})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>{JSON.stringify(booking.items)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            {/* Create Invoice Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInvoiceForm(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleCloseChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Creation Dialog */}
        <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Invoice
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Select Company</Label>
                <Select value={selectedCompanyForInvoice} onValueChange={setSelectedCompanyForInvoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>{company.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {company.priceRange}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Invoice Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount..."
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreateInvoice} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
                <Button variant="outline" onClick={() => setShowInvoiceForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Messages */}
        <Card className="mb-4">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-96">
              <div className="p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'admin'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs opacity-75">
                            {message.senderType === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a company to send..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>{company.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {company.priceRange}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCompany && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCompany('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedCompany ? "Add a message with the company info..." : "Type your message..."}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !selectedCompany)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Chat Rooms</h2>
        <Badge variant="secondary" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Mode
        </Badge>
      </div>

      {chatRoomsLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading chat rooms...</p>
        </div>
      ) : chatRooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chat Rooms</h3>
            <p className="text-muted-foreground">
              Chat rooms will appear here after you approve bookings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {chatRooms.map((chatRoom: any) => (
            <Card key={chatRoom.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-r from-green-600 to-blue-600">
                      <AvatarFallback className="text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {chatRoom.bookingType === 'moving' ? 'Moving Service' :
                         chatRoom.bookingType === 'disposal' ? 'Disposal Service' :
                         'Transport Service'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Booking #{chatRoom.bookingId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(chatRoom.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleChatRoomClick(chatRoom.id)}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChat; 