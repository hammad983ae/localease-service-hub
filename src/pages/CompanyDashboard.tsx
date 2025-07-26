import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Download
} from 'lucide-react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import ChatBot from '@/components/ChatBot';

interface ServiceRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  fromAddress: string;
  toAddress: string;
  requestedDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  notes?: string;
}

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

const CompanyDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(COMPANY_BOOKINGS_QUERY, { fetchPolicy: 'network-only' });
  const requests = data?.companyBookings || [];
  const [approveBooking] = useMutation(COMPANY_APPROVE_BOOKING_MUTATION);
  const [rejectBooking] = useMutation(COMPANY_REJECT_BOOKING_MUTATION);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveBooking({ variables: { id: requestId } });
      } else {
        await rejectBooking({ variables: { id: requestId } });
      }
      // Refetch the data to show updated status
      refetch();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      // You could add a toast notification here
    }
  };

  const handleChatClick = () => {
    navigate('/chats');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    acceptedRequests: requests.filter(r => r.status === 'accepted').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    rating: 4.8,
    totalReviews: 127,
    monthlyRevenue: 12450,
    responseTime: '2.3 hrs'
  };

  const recentMetrics = [
    { label: 'This Week', bookings: 23, revenue: 3200, growth: '+15%' },
    { label: 'This Month', bookings: 89, revenue: 12450, growth: '+28%' },
    { label: 'Quarter', bookings: 245, revenue: 34200, growth: '+18%' }
  ];

  return (
    <div className="relative">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
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
              <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
                <MessageCircle className="h-4 w-4" />
                Customer Chat
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-medium">Total Requests</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">All time</span>
                    </div>
                  </div>
                  <Users className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 font-medium">Pending</p>
                    <p className="text-3xl font-bold mt-2">{stats.pendingRequests}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Needs attention</span>
                    </div>
                  </div>
                  <AlertCircle className="h-12 w-12 text-amber-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 font-medium">Completed</p>
                    <p className="text-3xl font-bold mt-2">{stats.completedRequests}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Success rate: 94%</span>
                    </div>
                  </div>
                  <CheckCircle className="h-12 w-12 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-medium">Rating</p>
                    <p className="text-3xl font-bold mt-2 flex items-center gap-2">
                      {stats.rating}
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Award className="h-4 w-4" />
                      <span className="text-sm">{stats.totalReviews} reviews</span>
                    </div>
                  </div>
                  <Star className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recentMetrics.map((metric, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{metric.label}</h3>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {metric.growth}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bookings</span>
                      <span className="font-bold text-xl">{metric.bookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-bold text-xl text-green-600">${metric.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min((metric.bookings / 100) * 100, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit">
              <TabsTrigger value="requests" className="gap-2">
                <Calendar className="h-4 w-4" />
                Service Requests
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <Target className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <Building2 className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Service Requests
                    </CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-primary bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                                  <AvatarFallback>
                                    {request.contact?.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">{request.contact?.name || 'Unknown Customer'}</h3>
                                  <Badge variant="outline" className={`text-${getStatusColor(request.status)}-600`}>
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Email:</span>
                                    <span>{request.contact?.email || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Phone:</span>
                                    <span>{request.contact?.phone || 'N/A'}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">From:</span>
                                    <span className="truncate">{request.addresses?.from || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">To:</span>
                                    <span className="truncate">{request.addresses?.to || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Date:</span>
                                    <span>
                                      {request.dateTime ? new Date(request.dateTime).toLocaleDateString() : 
                                       request.dateTimeFlexible ? 'Flexible' : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {request.contact?.notes && (
                                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500 mb-4">
                                  <p className="text-sm">
                                    <strong className="text-blue-700">Notes:</strong> {request.contact.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleRequestAction(request.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700 gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequestAction(request.id, 'reject')}
                                    className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              {request.status === 'accepted' && (
                                <Button
                                  onClick={handleChatClick}
                                  className="gap-2 bg-gradient-to-r from-primary to-blue-600"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  Chat with Customer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {requests.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No service requests yet</h3>
                        <p className="text-muted-foreground">When customers request your services, they'll appear here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">Business Analytics</h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      Get insights into your business performance, revenue trends, and customer satisfaction.
                    </p>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-blue-600">
                      <TrendingUp className="h-4 w-4" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="font-semibold">96%</span>
                      </div>
                      <Progress value={96} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="font-semibold">2.3 hrs</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Completion Rate</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <Progress value={94} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average per booking</span>
                          <span className="font-medium">$140</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Growth rate</span>
                          <span className="font-medium text-green-600">+28%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{user?.full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{user?.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{user?.phone || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.services?.map((service: string) => (
                          <Badge key={service} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{user?.description || 'No description provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ChatBot userType="company" />
    </div>
  );
};

export default CompanyDashboard;
