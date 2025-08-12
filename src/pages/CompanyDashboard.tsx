import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  DollarSign,
  BarChart3,
  Award,
  Target,
  Filter,
  Download,
  Send,
  X,
  User,
  ArrowLeft,
  MoreVertical,
  FileText,
  Eye,
  Truck,
  Package,
  Home,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import Chat from '@/components/Chat';

// TypeScript Interfaces
interface Booking {
  id: string;
  status: 'pending' | 'pending_company_approval' | 'approved' | 'rejected' | 'completed';
  bookingType?: string;
  createdAt: string;
  dateTime?: string;
  dateTimeFlexible?: string;
  addresses?: { from: string; to: string };
  contact?: { name: string; email: string; phone: string; notes?: string };
  rooms?: Array<{ room: string; floor: number; count: number }>;
  items?: any[];
  company?: { name: string; email: string; phone: string; address: string };
}

interface ChatRoom {
  id: string;
  bookingId: string;
  bookingType: string;
  userId: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
}

interface Invoice {
  id: string;
  bookingId: string;
  companyId: string;
  createdBy: string;
  amount: number;
  currency: string;
  status: string;
  documentUrl?: string;
  createdAt: string;
  bookingDetails?: any;
}

interface User {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  rating: number;
  totalReviews: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
  responseTime: string;
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'pending':
    case 'pending_company_approval':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'pending_company_approval': 
        return 'bg-yellow-100 text-yellow-800';
      case 'approved': 
        return 'bg-green-100 text-green-800';
      case 'rejected': 
        return 'bg-red-100 text-red-800';
      case 'completed': 
        return 'bg-blue-100 text-blue-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const DashboardHeader: React.FC<{ user: User | null }> = ({ user }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome back, {user?.full_name || 'Company'}! Here's what's happening with your services.
      </p>
    </div>
    <div className="flex items-center space-x-4">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  </div>
);

const StatsCard: React.FC<{
  title: string;
  value: string | number | React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
}> = ({ title, value, subtitle, icon, gradient, iconColor }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${gradient}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatsGrid: React.FC<{ stats: DashboardStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatsCard
      title="Total Requests"
      value={stats.totalRequests}
      subtitle="All time requests"
      icon={<TrendingUp className="h-6 w-6" />}
      gradient="bg-blue-100"
      iconColor="text-blue-600"
    />
    <StatsCard
      title="Pending Requests"
      value={stats.pendingRequests}
      subtitle="Awaiting approval"
      icon={<Clock className="h-6 w-6" />}
      gradient="bg-yellow-100"
      iconColor="text-yellow-600"
    />
    <StatsCard
      title="Total Revenue"
      value={`$${stats.totalRevenue.toLocaleString()}`}
      subtitle={`+${stats.growthRate}% this month`}
      icon={<DollarSign className="h-6 w-6" />}
      gradient="bg-green-100"
      iconColor="text-green-600"
    />
    <StatsCard
      title="Rating"
      value={`${stats.rating}/5`}
      subtitle={`${stats.totalReviews} reviews`}
      icon={<Star className="h-6 w-6" />}
      gradient="bg-purple-100"
      iconColor="text-purple-600"
    />
  </div>
);

const BookingItem: React.FC<{
  booking: Booking;
  onChatClick: (bookingId: string) => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
}> = ({ booking, onChatClick, onApprove, onReject }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Calendar className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium">Booking #{booking.id}</p>
        <p className="text-sm text-muted-foreground">
          {booking.contact?.name} • {new Date(booking.createdAt).toLocaleDateString()}
        </p>
        {booking.addresses && (
          <p className="text-xs text-muted-foreground">
            {booking.addresses.from} → {booking.addresses.to}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Type: {booking.bookingType || 'Unknown'} • Status: {booking.status}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <StatusBadge status={booking.status} />
      
      {/* Show approval buttons only for pending company approval bookings */}
      {booking.status === 'pending_company_approval' && onApprove && onReject && (
        <>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onApprove(booking.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onReject(booking.id)}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </>
      )}
      
      {/* Show chat button for approved bookings */}
      {booking.status === 'approved' && (
        <Button variant="outline" size="sm" onClick={() => onChatClick(booking.id)}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      )}
    </div>
  </div>
);

const ChatRoomItem: React.FC<{
  room: ChatRoom;
  onChatClick: (bookingId: string) => void;
}> = ({ room, onChatClick }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-green-100 rounded-lg">
        <MessageCircle className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p className="font-medium">Chat #{room.id}</p>
        <p className="text-sm text-muted-foreground">
          Booking #{room.bookingId} • {room.bookingType}
        </p>
        {room.lastMessage && (
          <p className="text-xs text-muted-foreground truncate max-w-xs">
            {room.lastMessage.content}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Badge variant={room.isActive ? "default" : "secondary"}>
        {room.isActive ? 'Active' : 'Inactive'}
      </Badge>
      <Button variant="outline" size="sm" onClick={() => onChatClick(room.bookingId)}>
        Open Chat
      </Button>
    </div>
  </div>
);

const InvoiceItem: React.FC<{
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
}> = ({ invoice, onViewDetails }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-purple-100 rounded-lg">
        <FileText className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="font-medium">Invoice #{invoice.id}</p>
        <p className="text-sm text-muted-foreground">
          Booking #{invoice.bookingId} • {new Date(invoice.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <p className="font-medium">${invoice.amount}</p>
      <Badge variant="outline">{invoice.status}</Badge>
      <Button variant="outline" size="sm" onClick={() => onViewDetails(invoice)}>
        <Eye className="h-4 w-4 mr-2" />
        View
      </Button>
    </div>
  </div>
);

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First, try to fix any chat rooms that are missing companyId
        try {
          await apiClient.fixCompanyChatRooms();
          console.log('✅ Chat rooms fixed successfully');
        } catch (fixError) {
          console.log('⚠️ Chat room fix not needed or failed:', fixError);
        }
        
        const [bookingsData, chatData, invoicesData] = await Promise.all([
          apiClient.getCompanyBookings(),
          apiClient.getCompanyChatRooms(),
          apiClient.getCompanyInvoices()
        ]);
        
        setBookings(bookingsData.bookings || []);
        setChatRooms(chatData.chatRooms || []);
        setInvoices(invoicesData.invoices || []);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalRequests: bookings.length,
    pendingRequests: bookings.filter(b => b.status === 'pending' || b.status === 'pending_company_approval').length,
    acceptedRequests: bookings.filter(b => b.status === 'approved').length,
    completedRequests: bookings.filter(b => b.status === 'completed').length,
    rating: 4.8,
    totalReviews: 127,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    monthlyRevenue: invoices
      .filter(inv => new Date(inv.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, inv) => sum + inv.amount, 0),
    growthRate: 12.5,
    responseTime: '2.3h'
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await apiClient[action === 'approve' ? 'approveCompanyBooking' : 'rejectCompanyBooking'](requestId, 'moving');
      // Refresh all data including chat rooms
      const [bookingsData, chatData, invoicesData] = await Promise.all([
        apiClient.getCompanyBookings(),
        apiClient.getCompanyChatRooms(),
        apiClient.getCompanyInvoices()
      ]);
      
      setBookings(bookingsData.bookings || []);
      setChatRooms(chatData.chatRooms || []);
      setInvoices(invoicesData.invoices || []);
      
      console.log('🔍 CompanyDashboard: Refreshed data after', action);
      console.log('🔍 CompanyDashboard: Chat rooms:', chatData.chatRooms);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const handleApproveRequest = (bookingId: string) => {
    handleRequestAction(bookingId, 'approve');
  };

  const handleRejectRequest = (bookingId: string) => {
    handleRequestAction(bookingId, 'reject');
  };

  const handleChatWithCustomer = (bookingId: string) => {
    console.log('🔍 CompanyDashboard: handleChatWithCustomer called with bookingId:', bookingId);
    console.log('🔍 CompanyDashboard: Current chatRooms:', chatRooms);
    console.log('🔍 CompanyDashboard: Looking for chat room with bookingId:', bookingId);
    
    // Debug each chat room to see the structure
    chatRooms.forEach((room, index) => {
      console.log(`🔍 CompanyDashboard: Chat room ${index}:`, {
        id: room.id,
        bookingId: room.bookingId,
        bookingType: room.bookingType,
        fullRoom: room
      });
    });
    
    setActiveChat(bookingId);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleViewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseInvoiceDetails = () => {
    setSelectedInvoice(null);
  };

  const handleViewServiceDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseServiceDetails = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  const currentActiveChatRoom = chatRooms.find(room => {
    console.log('🔍 CompanyDashboard: Comparing room.bookingId:', room.bookingId, 'with activeChat:', activeChat);
    console.log('🔍 CompanyDashboard: Types - room.bookingId:', typeof room.bookingId, 'activeChat:', typeof activeChat);
    console.log('🔍 CompanyDashboard: Equality check:', room.bookingId === activeChat);
    return room.bookingId === activeChat;
  });
  
  console.log('🔍 CompanyDashboard: currentActiveChatRoom found:', currentActiveChatRoom);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader user={user} />
      
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={booking}
                  onChatClick={handleChatWithCustomer}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Chat Rooms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Active Chats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chatRooms.slice(0, 5).map((room) => (
                <ChatRoomItem
                  key={room.id}
                  room={room}
                  onChatClick={handleChatWithCustomer}
                />
              ))}
              {chatRooms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active chats
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Invoices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <InvoiceItem
                key={invoice.id}
                invoice={invoice}
                onViewDetails={handleViewInvoiceDetails}
              />
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {activeChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Chat for Booking #{activeChat}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              {currentActiveChatRoom ? (
                <Chat
                  chatRoomData={currentActiveChatRoom}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Chat Room Not Found</h3>
                    <p className="text-muted-foreground">
                      Chat room for this booking is being created. Please wait a moment and try again.
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Available chat rooms: {chatRooms.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Looking for booking ID: {activeChat}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Chat room IDs: {chatRooms.map(r => r.bookingId).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Invoice ID</p>
                  <p className="text-sm text-muted-foreground">#{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm text-muted-foreground">${selectedInvoice.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline">{selectedInvoice.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Booking ID</p>
                  <p className="text-sm text-muted-foreground">#{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.contact?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedBooking.addresses && (
                <div>
                  <p className="text-sm font-medium">Route</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.addresses.from} → {selectedBooking.addresses.to}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDashboard;
