import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QuoteDocuments from './QuoteDocuments';
import AdminChat from './AdminChat';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';

const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminStats {
      totalUsers
      activeCompanies
      totalBookings
      totalRevenue
      monthlyRevenue
      growthRate
      pendingApprovals
      totalInvoices
      averageBookingValue
      userSatisfaction
      responseTime
      completionRate
    }
  }
`;

const GET_ADMIN_USERS = gql`
  query GetAdminUsers {
    adminUsers {
      id
      email
      full_name
      phone
      address
      role
    }
  }
`;

const GET_ADMIN_COMPANIES = gql`
  query GetAdminCompanies {
    adminCompanies {
      id
      name
      email
      phone
      address
      description
      services
      priceRange
      companyType
      createdAt
    }
  }
`;

const GET_ADMIN_BOOKINGS = gql`
  query GetAdminBookings {
    adminBookings {
      id
      userId
      rooms {
        floor
        room
        count
      }
      items
      dateTime
      dateTimeFlexible
      addresses {
        from
        to
      }
      contact {
        name
        email
        phone
        notes
      }
      company {
        name
        email
        phone
      }
      status
      createdAt
    }
  }
`;

const GET_ADMIN_DISPOSAL_BOOKINGS = gql`
  query GetAdminDisposalBookings {
    adminDisposalBookings {
      id
      userId
      serviceType
      items {
        type
        description
        quantity
      }
      dateTime
      dateTimeFlexible
      pickupAddress {
        fullAddress
      }
      contact {
        name
        email
        phone
        notes
      }
      company {
        name
        email
        phone
      }
      status
      createdAt
    }
  }
`;

const GET_ADMIN_TRANSPORT_BOOKINGS = gql`
  query GetAdminTransportBookings {
    adminTransportBookings {
      id
      userId
      serviceType
      items {
        type
        description
        quantity
      }
      dateTime
      dateTimeFlexible
      pickupLocation {
        fullAddress
      }
      dropoffLocation {
        fullAddress
      }
      contact {
        name
        email
        phone
        notes
      }
      company {
        name
        email
        phone
      }
      status
      createdAt
    }
  }
`;

const GET_ADMIN_INVOICES = gql`
  query GetAdminInvoices {
    allQuoteDocuments {
      id
      bookingId
      amount
      currency
      status
      documentUrl
      createdAt
      bookingDetails
    }
  }
`;

const APPROVE_BOOKING = gql`
  mutation ApproveBooking($id: ID!) {
    approveBooking(id: $id) {
      id
      status
    }
  }
`;

const REJECT_BOOKING = gql`
  mutation RejectBooking($id: ID!) {
    rejectBooking(id: $id) {
      id
      status
    }
  }
`;

const APPROVE_DISPOSAL_BOOKING = gql`
  mutation ApproveDisposalBooking($id: ID!) {
    approveDisposalBooking(id: $id) {
      id
      status
    }
  }
`;

const REJECT_DISPOSAL_BOOKING = gql`
  mutation RejectDisposalBooking($id: ID!) {
    rejectDisposalBooking(id: $id) {
      id
      status
    }
  }
`;

const APPROVE_TRANSPORT_BOOKING = gql`
  mutation ApproveTransportBooking($id: ID!) {
    approveTransportBooking(id: $id) {
      id
      status
    }
  }
`;

const REJECT_TRANSPORT_BOOKING = gql`
  mutation RejectTransportBooking($id: ID!) {
    rejectTransportBooking(id: $id) {
      id
      status
    }
  }
`;

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
  Package
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Debug user authentication
  console.log('AdminDashboard - Current user:', user);
  console.log('AdminDashboard - User role:', user?.role);
  console.log('AdminDashboard - User ID:', user?.id);

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_ADMIN_STATS, {
    errorPolicy: 'all',
  });
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ADMIN_USERS, {
    errorPolicy: 'all',
  });
  const { data: companiesData, loading: companiesLoading, error: companiesError } = useQuery(GET_ADMIN_COMPANIES, {
    errorPolicy: 'all',
  });
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(GET_ADMIN_BOOKINGS, {
    errorPolicy: 'all',
  });
  const { data: disposalBookingsData, loading: disposalBookingsLoading, error: disposalBookingsError } = useQuery(GET_ADMIN_DISPOSAL_BOOKINGS, {
    errorPolicy: 'all',
  });
  const { data: transportBookingsData, loading: transportBookingsLoading, error: transportBookingsError } = useQuery(GET_ADMIN_TRANSPORT_BOOKINGS, {
    errorPolicy: 'all',
  });
  const { data: invoicesData, loading: invoicesLoading, error: invoicesError } = useQuery(GET_ADMIN_INVOICES, {
    errorPolicy: 'all',
  });

  // Handle GraphQL errors
  if (statsError) console.error('Error fetching admin stats:', statsError);
  if (usersError) console.error('Error fetching admin users:', usersError);
  if (companiesError) console.error('Error fetching admin companies:', companiesError);
  if (bookingsError) console.error('Error fetching admin bookings:', bookingsError);
  if (disposalBookingsError) console.error('Error fetching admin disposal bookings:', disposalBookingsError);
  if (transportBookingsError) console.error('Error fetching admin transport bookings:', transportBookingsError);
  if (invoicesError) console.error('Error fetching admin invoices:', invoicesError);

  // Debug logging
  console.log('AdminDashboard - Stats data:', statsData);
  console.log('AdminDashboard - Users data:', usersData);
  console.log('AdminDashboard - Companies data:', companiesData);
  console.log('AdminDashboard - Bookings data:', bookingsData);
  console.log('AdminDashboard - Invoices data:', invoicesData);

  // Mutation hooks
  const [approveBooking] = useMutation(APPROVE_BOOKING);
  const [rejectBooking] = useMutation(REJECT_BOOKING);
  const [approveDisposalBooking] = useMutation(APPROVE_DISPOSAL_BOOKING);
  const [rejectDisposalBooking] = useMutation(REJECT_DISPOSAL_BOOKING);
  const [approveTransportBooking] = useMutation(APPROVE_TRANSPORT_BOOKING);
  const [rejectTransportBooking] = useMutation(REJECT_TRANSPORT_BOOKING);

  // Combine all booking types
  const movingBookings = bookingsData?.adminBookings || [];
  const disposalBookings = disposalBookingsData?.adminDisposalBookings || [];
  const transportBookings = transportBookingsData?.adminTransportBookings || [];

  const allBookings = [
    ...movingBookings.map((booking: any) => ({ ...booking, type: 'moving' })),
    ...disposalBookings.map((booking: any) => ({ ...booking, type: 'disposal' })),
    ...transportBookings.map((booking: any) => ({ ...booking, type: 'transport' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const isLoadingBookings = bookingsLoading || disposalBookingsLoading || transportBookingsLoading;

  const handleApproveBooking = async (bookingId: string, bookingType: string) => {
    try {
      switch (bookingType) {
        case 'moving':
          await approveBooking({ variables: { id: bookingId } });
          break;
        case 'disposal':
          await approveDisposalBooking({ variables: { id: bookingId } });
          break;
        case 'transport':
          await approveTransportBooking({ variables: { id: bookingId } });
          break;
      }
      // Refetch queries to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error approving booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string, bookingType: string) => {
    try {
      switch (bookingType) {
        case 'moving':
          await rejectBooking({ variables: { id: bookingId } });
          break;
        case 'disposal':
          await rejectDisposalBooking({ variables: { id: bookingId } });
          break;
        case 'transport':
          await rejectTransportBooking({ variables: { id: bookingId } });
          break;
      }
      // Refetch queries to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
    }
  };

  const stats = statsData?.adminStats || {
    totalUsers: 0,
    activeCompanies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    pendingApprovals: 0,
    totalInvoices: 0,
    averageBookingValue: 0,
    userSatisfaction: 0,
    responseTime: 0,
    completionRate: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitor and manage your LocalEase platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{stats.growthRate.toFixed(1)}% this month</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 font-medium">Active Companies</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeCompanies}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">across 12 cities</span>
                  </div>
                </div>
                <Building2 className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Monthly: {formatCurrency(stats.monthlyRevenue)}</span>
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <FileText className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Approvals */}
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Pending Approvals
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm">
                      {allBookings.filter((b: any) => b.status === 'pending').length} pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allBookings.filter((booking: any) => booking.status === 'pending').slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {booking.contact?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.type === 'moving' ? 'Moving Service' :
                               booking.type === 'disposal' ? `Disposal: ${booking.serviceType}` :
                               booking.type === 'transport' ? `Transport: ${booking.serviceType}` :
                               'Service'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveBooking(booking.id, booking.type)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectBooking(booking.id, booking.type)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {allBookings.filter((b: any) => b.status === 'pending').length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending approvals</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allBookings.slice(0, 5).map((booking: any, index: number) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {booking.contact?.name || 'Unknown Customer'} - {booking.company?.name || 'No Company'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.createdAt)} - {
                                booking.type === 'moving' ? booking.addresses?.from || 'N/A' :
                                booking.type === 'disposal' ? booking.pickupAddress?.fullAddress || 'N/A' :
                                booking.type === 'transport' ? `${booking.pickupLocation?.fullAddress || 'N/A'} → ${booking.dropoffLocation?.fullAddress || 'N/A'}` :
                                'N/A'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.type === 'moving' ? 'Moving Service' :
                               booking.type === 'disposal' ? `Disposal: ${booking.serviceType}` :
                               booking.type === 'transport' ? `Transport: ${booking.serviceType}` :
                               'Service'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                    {isLoadingBookings && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Loading recent activity...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="text-center py-4">Loading invoices...</div>
                  ) : invoicesData?.allQuoteDocuments?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No invoices yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoicesData?.allQuoteDocuments?.slice(0, 5).map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Invoice #{invoice.id.slice(-8)}</p>
                              <p className="text-xs text-muted-foreground">
                                {invoice.bookingDetails?.companyName || 'Unknown Company'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">${invoice.amount}</p>
                            <Badge variant="default" className="text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companiesData?.adminCompanies?.slice(0, 3).map((company: any, index: number) => (
                      <div key={company.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{company.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">4.8</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{company.companyType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">{company.priceRange}</p>
                        </div>
                      </div>
                    ))}
                    {companiesLoading && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Loading companies...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">User Satisfaction</h3>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-bold">{stats.userSatisfaction.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.userSatisfaction} className="h-2" />
                    <p className="text-xs text-muted-foreground">{stats.userSatisfaction.toFixed(1)}% positive feedback</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Platform Usage</h3>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Bookings</span>
                      <span className="font-bold">{stats.totalBookings}</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">{stats.completionRate.toFixed(1)}% completion rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Response Time</h3>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Response</span>
                      <span className="font-bold">{stats.responseTime.toFixed(1)} hrs</span>
                    </div>
                    <Progress value={Math.min(100, (24 - stats.responseTime) / 24 * 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Average response time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tab contents would go here */}
          <TabsContent value="users">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData?.adminUsers?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.role}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {usersData?.adminUsers?.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                        <p className="text-muted-foreground">No users have registered yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading companies...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companiesData?.adminCompanies?.map((company: any) => (
                      <div key={company.id} className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {company.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{company.name}</p>
                            <p className="text-sm text-muted-foreground">{company.email}</p>
                            <p className="text-xs text-muted-foreground">{company.phone || 'No phone'}</p>
                            <div className="flex gap-1 mt-1">
                              {company.services?.slice(0, 3).map((service: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{company.companyType}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(company.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.priceRange}
                          </p>
                        </div>
                      </div>
                    ))}
                    {companiesData?.adminCompanies?.length === 0 && (
                      <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
                        <p className="text-muted-foreground">No companies have registered yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Booking Analytics</h3>
                  <p className="text-muted-foreground">Comprehensive booking data, trends, and insights.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Quote Documents</h3>
                  <p className="text-muted-foreground">All accepted quotes and generated invoices.</p>
                  <div className="mt-4">
                    <QuoteDocuments />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground">Revenue analytics, growth metrics, and predictive insights.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Admin Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminChat />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
