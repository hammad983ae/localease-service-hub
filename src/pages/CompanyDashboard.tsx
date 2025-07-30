import React, { useState } from 'react';
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
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Chat from '@/components/Chat';

// TypeScript Interfaces
interface Booking {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
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
  monthlyRevenue: number;
  responseTime: string;
}

// GraphQL Queries
const COMPANY_BOOKINGS_QUERY = gql`
  query CompanyBookings {
    companyBookings {
      id
      status
      createdAt
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

const COMPANY_APPROVE_BOOKING_MUTATION = gql`
  mutation CompanyApproveBooking($id: ID!) {
    companyApproveBooking(id: $id) {
      id
      status
    }
  }
`;

const COMPANY_REJECT_BOOKING_MUTATION = gql`
  mutation CompanyRejectBooking($id: ID!) {
    companyRejectBooking(id: $id) {
      id
      status
    }
  }
`;

const GET_COMPANY_CHAT_ROOMS = gql`
  query CompanyChatRooms {
    companyChatRooms {
      id
      bookingId
      bookingType
      userId
      companyId
      isActive
      createdAt
      lastMessage {
        id
        content
        createdAt
      }
    }
  }
`;

const GET_COMPANY_INVOICES = gql`
  query GetCompanyInvoices {
    companyQuoteDocuments {
      id
      bookingId
      companyId
      createdBy
      amount
      currency
      status
      documentUrl
      createdAt
      bookingDetails
    }
  }
`;

// Helper Components
const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  const iconMap = {
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    accepted: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
    completed: <CheckCircle className="h-4 w-4 text-blue-500" />
  };
  return iconMap[status as keyof typeof iconMap] || <Clock className="h-4 w-4" />;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap = {
    pending: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
    completed: 'outline'
  } as const;
  
  return (
    <Badge variant={colorMap[status as keyof typeof colorMap] || 'secondary'}>
      {status}
    </Badge>
  );
};

// Dashboard Header Component
const DashboardHeader: React.FC<{ user: User | null }> = ({ user }) => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 bg-gradient-to-r from-primary to-blue-600">
        <AvatarFallback className="bg-transparent text-white text-xl font-bold">
          {user?.full_name?.charAt(0) || 'C'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome back, {user?.full_name || 'Company'}
        </h1>
        <p className="text-muted-foreground text-lg mt-1">
          Manage your business operations and grow your success
        </p>
      </div>
    </div>
    <div className="flex gap-3">
      <Button variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export Report
      </Button>
    </div>
  </div>
);

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number | React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
}> = ({ title, value, subtitle, icon, gradient, iconColor }) => (
  <Card className={`bg-gradient-to-br ${gradient} text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <div className="flex items-center gap-2 mt-3">
            {icon}
            <span className="text-sm">{subtitle}</span>
          </div>
        </div>
        <div className={`h-12 w-12 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stats Grid Component
const StatsGrid: React.FC<{ stats: DashboardStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatsCard
      title="Total Requests"
      value={stats.totalRequests}
      subtitle="All time"
      icon={<TrendingUp className="h-4 w-4" />}
      gradient="from-blue-500 to-blue-600"
      iconColor="text-blue-200"
    />
    <StatsCard
      title="Pending"
      value={stats.pendingRequests}
      subtitle="Pending"
      icon={<Clock className="h-4 w-4" />}
      gradient="from-amber-500 to-orange-500"
      iconColor="text-amber-200"
    />
    <StatsCard
      title="Completed"
      value={stats.completedRequests}
      subtitle="Success rate: 94%"
      icon={<CheckCircle className="h-4 w-4" />}
      gradient="from-emerald-500 to-green-600"
      iconColor="text-emerald-200"
    />
    <StatsCard
      title="Rating"
      value={
        <span className="flex items-center gap-2">
          {stats.rating}
          <Star className="h-5 w-5 text-yellow-300 fill-current" />
        </span>
      }
      subtitle={`${stats.totalReviews} reviews`}
      icon={<Award className="h-4 w-4" />}
      gradient="from-purple-500 to-purple-600"
      iconColor="text-purple-200"
    />
  </div>
);

// Booking Item Component
const BookingItem: React.FC<{
  booking: Booking;
  onChatClick: (bookingId: string) => void;
}> = ({ booking, onChatClick }) => (
  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
    <div className="flex items-center gap-3">
      <StatusIcon status={booking.status} />
      <div>
        <p className="font-medium">
          {booking.contact?.name || 'Customer'}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.addresses?.from || 'Moving service'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <StatusBadge status={booking.status} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChatClick(booking.id)}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Chat Room Item Component
const ChatRoomItem: React.FC<{
  room: ChatRoom;
  onChatClick: (bookingId: string) => void;
}> = ({ room, onChatClick }) => (
  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">Booking #{room.bookingId}</p>
        <p className="text-sm text-muted-foreground">
          {room.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onChatClick(room.bookingId)}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  </div>
);

// Invoice Item Component
const InvoiceItem: React.FC<{
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
}> = ({ invoice, onViewDetails }) => (
  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <DollarSign className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">Invoice #{invoice.id}</p>
        <p className="text-sm text-muted-foreground">
          Amount: ${invoice.amount} {invoice.currency}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
        {invoice.status}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails(invoice)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Chat Interface Component
const ChatInterface: React.FC<{
  activeChat: string;
  currentActiveChatRoom: ChatRoom | null;
  onCloseChat: () => void;
}> = ({ activeChat, currentActiveChatRoom, onCloseChat }) => (
  <div className="h-screen flex flex-col bg-white">
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseChat}
            className="gap-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-white/20">
              <AvatarFallback className="text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Customer Chat</h2>
              <p className="text-sm text-white/80">
                Booking #{activeChat}
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div className="flex-1 overflow-hidden">
      <Chat chatRoomId={currentActiveChatRoom?.id || ''} onClose={onCloseChat} />
    </div>
  </div>
);

// Service Analytics Component
const ServiceAnalytics: React.FC<{ 
  bookings: Booking[];
  invoices: Invoice[];
}> = ({ bookings, invoices }) => {
  const completedBookings = bookings.filter(b => b.status === 'completed');
  
  // Calculate actual revenue from invoices
  const totalRevenue = invoices.reduce((sum, invoice) => {
    return sum + (invoice.amount || 0);
  }, 0);

  // Calculate average revenue per invoice
  const averageRevenue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  // Calculate monthly revenue (invoices from current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  // Calculate previous month revenue for growth comparison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    return invoiceDate.getMonth() === previousMonth && invoiceDate.getFullYear() === previousYear;
  });
  const previousMonthRevenue = previousMonthInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  
  // Calculate growth percentage
  const growthPercentage = previousMonthRevenue > 0 
    ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : 0;

  const serviceTypes = completedBookings.reduce((acc, booking) => {
    const type = booking.addresses?.from ? 'Moving Service' : 'Other Service';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{completedBookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Completed</p>
            </div>
            <div className="space-y-2">
              {Object.entries(serviceTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average per invoice</span>
                <span className="font-medium">${Math.round(averageRevenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">This month</span>
                <span className={`font-medium ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly revenue</span>
                <span className="font-medium">${monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-semibold">96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Service Completion Rate</span>
                <span className="font-semibold">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <span className="font-semibold">2.3 hrs</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Completed Service Item Component
const CompletedServiceItem: React.FC<{
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}> = ({ booking, onViewDetails }) => {
  const serviceType = booking.addresses?.from ? 'Moving Service' : 'Other Service';
  const estimatedRevenue = booking.addresses?.from ? 150 : 100;

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium">
            {booking.contact?.name || 'Customer'}
          </p>
          <p className="text-sm text-muted-foreground">
            {serviceType} • {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-green-600">
          ${estimatedRevenue}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(booking)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Pending Request Item Component
const PendingRequestItem: React.FC<{
  booking: Booking;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onChatClick: (bookingId: string) => void;
}> = ({ booking, onApprove, onReject, onChatClick }) => (
  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
    <div className="flex items-center gap-3">
      <StatusIcon status={booking.status} />
      <div>
        <p className="font-medium">
          {booking.contact?.name || 'Customer'}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.addresses?.from || 'Moving service'}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(booking.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <StatusBadge status={booking.status} />
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChatClick(booking.id)}
          className="h-8 w-8 p-0"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onApprove(booking.id)}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReject(booking.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

// Recent Activity Component
const RecentActivity: React.FC<{
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onChatClick: (bookingId: string) => void;
}> = ({ bookings, onViewDetails, onApprove, onReject, onChatClick }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Completed Services */}
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Recent Completed Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {bookings
              .filter(booking => booking.status === 'completed')
              .slice(0, 5)
              .map((booking) => (
                <CompletedServiceItem
                  key={booking.id}
                  booking={booking}
                  onViewDetails={onViewDetails}
                />
              ))}
            {bookings.filter(b => b.status === 'completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed services yet</p>
                <p className="text-sm">Completed services will appear here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    {/* Pending Requests */}
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {bookings
              .filter(booking => booking.status === 'pending')
              .slice(0, 5)
              .map((booking) => (
                <PendingRequestItem
                  key={booking.id}
                  booking={booking}
                  onApprove={onApprove}
                  onReject={onReject}
                  onChatClick={onChatClick}
                />
              ))}
            {bookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending requests</p>
                <p className="text-sm">All caught up!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

// Main Dashboard Component
const CompanyDashboard: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const navigate = useNavigate();

  // GraphQL queries and mutations
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(COMPANY_BOOKINGS_QUERY);
  const { data: chatRoomsData, loading: chatRoomsLoading } = useQuery(GET_COMPANY_CHAT_ROOMS);
  const { data: invoiceData, loading: invoiceLoading } = useQuery(GET_COMPANY_INVOICES);
  const [companyApproveBooking] = useMutation(COMPANY_APPROVE_BOOKING_MUTATION);
  const [companyRejectBooking] = useMutation(COMPANY_REJECT_BOOKING_MUTATION);

  // Data processing
  const bookings: Booking[] = bookingsData?.companyBookings || [];
  const chatRooms: ChatRoom[] = chatRoomsData?.companyChatRooms || [];
  const invoices: Invoice[] = invoiceData?.companyQuoteDocuments || [];
  const currentActiveChatRoom = activeChat ? chatRooms.find((room) => room.bookingId === activeChat) || null : null;

  // Calculate stats
  const stats: DashboardStats = {
    totalRequests: bookings.length,
    pendingRequests: bookings.filter(r => r.status === 'pending').length,
    acceptedRequests: bookings.filter(r => r.status === 'accepted').length,
    completedRequests: bookings.filter(r => r.status === 'completed').length,
    rating: 4.8,
    totalReviews: 127,
    monthlyRevenue: 12450,
    responseTime: '2.3 hrs'
  };

  // Event handlers
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await companyApproveBooking({ variables: { id: requestId } });
      } else {
        await companyRejectBooking({ variables: { id: requestId } });
      }
    } catch (error: any) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleApproveRequest = (bookingId: string) => {
    handleRequestAction(bookingId, 'approve');
  };

  const handleRejectRequest = (bookingId: string) => {
    handleRequestAction(bookingId, 'reject');
  };

  const handleChatWithCustomer = (bookingId: string) => {
    setActiveChat(bookingId);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveChat(null);
  };

  const handleViewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handleCloseInvoiceDetails = () => {
    setShowInvoiceDetails(false);
    setSelectedInvoice(null);
  };

  const handleViewServiceDetails = (booking: Booking) => {
    // This could open a modal with detailed service information
    console.log('View service details:', booking);
  };

  // Loading states
  if (bookingsLoading || chatRoomsLoading || invoiceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (bookingsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading data</h3>
            <p className="text-muted-foreground">{bookingsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showChat && currentActiveChatRoom ? (
        <ChatInterface
          activeChat={activeChat || ''}
          currentActiveChatRoom={currentActiveChatRoom}
          onCloseChat={handleCloseChat}
        />
      ) : (
        <div className="relative">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <DashboardHeader user={user} />
              <StatsGrid stats={stats} />

              {/* Service Analytics */}
              <ServiceAnalytics bookings={bookings} invoices={invoices} />

              {/* Recent Activity */}
              <RecentActivity 
                bookings={bookings}
                onViewDetails={handleViewServiceDetails}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                onChatClick={handleChatWithCustomer}
              />

              {/* Invoices Section */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.slice(0, 3).map((invoice) => (
                      <InvoiceItem
                        key={invoice.id}
                        invoice={invoice}
                        onViewDetails={handleViewInvoiceDetails}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">
                      Invoice #{selectedInvoice.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Generated on {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedInvoice.amount?.toLocaleString()}
                    </p>
                    <Badge variant="default" className="mt-1">
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              {selectedInvoice.bookingDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(selectedInvoice.bookingDetails, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyDashboard;
