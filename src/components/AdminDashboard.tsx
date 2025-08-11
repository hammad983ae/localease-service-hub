import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QuoteDocuments from './QuoteDocuments';
import AdminChat from './AdminChat';
import EnhancedAdminChat from './EnhancedAdminChat';
import RealTimeChatDemo from './RealTimeChatDemo';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  FileText,
  XCircle,
  MessageSquare,
  Package,
  User
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeCompanies: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
  pendingApprovals: number;
  totalInvoices: number;
  averageBookingValue: number;
  userSatisfaction: number;
  responseTime: number;
  completionRate: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
}

interface AdminCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  services: string[];
  priceRange: string;
  companyType: string;
  createdAt: string;
}

interface AdminBooking {
  _id: string;
  id?: string; // For backward compatibility
  userId: string;
  rooms?: Array<{ floor: number; room: string; count: number }>;
  items?: string[];
  dateTime?: string;
  dateTimeFlexible?: boolean;
  addresses?: Array<{ from: string; to: string }>;
  contact?: { name: string; email: string; phone: string; notes: string };
  company?: { name: string; email: string; phone: string };
  status: string;
  createdAt: string;
  type?: string;
}

interface AdminInvoice {
  id: string;
  quoteId: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug user authentication
  console.log('AdminDashboard - Current user:', user);
  console.log('AdminDashboard - User role:', user?.role);
  console.log('AdminDashboard - User ID:', user?.id);

  // Fetch all admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, usersData, companiesData, bookingsData, invoicesData] = await Promise.all([
          apiClient.getAdminStats(),
          apiClient.getAdminUsers(),
          apiClient.getAdminCompanies(),
          apiClient.getAdminBookings(),
          apiClient.getAdminInvoices()
        ]);

        setStats(statsData.stats);
        setUsers(usersData.users || []);
        setCompanies(companiesData.companies || []);
        setBookings(bookingsData.bookings || []);
        setInvoices(invoicesData.invoices || []);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Debug logging
  console.log('AdminDashboard - Stats data:', stats);
  console.log('AdminDashboard - Users data:', users);
  console.log('AdminDashboard - Companies data:', companies);
  console.log('AdminDashboard - Bookings data:', bookings);
  console.log('AdminDashboard - Invoices data:', invoices);

  const handleApproveBooking = async (bookingId: string, bookingType: string) => {
    try {
      await apiClient.updateBookingStatus(bookingType, bookingId, 'approved');
      // Refresh the data
      const bookingsData = await apiClient.getAdminBookings();
      setBookings(bookingsData.bookings || []);
    } catch (error: any) {
      console.error('Error approving booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string, bookingType: string) => {
    try {
      await apiClient.updateBookingStatus(bookingType, bookingId, 'rejected');
      // Refresh the data
      const bookingsData = await apiClient.getAdminBookings();
      setBookings(bookingsData.bookings || []);
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'rejected': return '✗';
      case 'completed': return '✓';
      default: return '?';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading dashboard</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.growthRate}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCompanies}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApprovals} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(stats.monthlyRevenue)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Progress value={stats.userSatisfaction} className="flex-1" />
                <span className="text-sm font-medium">{stats.userSatisfaction}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}h</div>
              <p className="text-xs text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Booking Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageBookingValue)}</div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="demo">Real-Time Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 10).map((booking, index) => (
                  <div key={booking.id || `booking-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="font-medium">Booking #{booking._id || booking.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.type} • {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </Badge>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveBooking(booking._id || booking.id, booking.type || 'moving')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectBooking(booking._id || booking.id, booking.type || 'moving')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div key={user.id || `user-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'No Name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company, index) => (
                  <div key={company.id || `company-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{company.name?.charAt(0) || 'C'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                        <p className="text-xs text-muted-foreground">{company.companyType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{company.priceRange}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(company.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <div key={invoice.id || `invoice-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="font-medium">Invoice #{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Quote #{invoice.quoteId} • Due: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <EnhancedAdminChat />
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <RealTimeChatDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
