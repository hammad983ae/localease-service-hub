
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { gql, useQuery, useMutation } from '@apollo/client';

const ALL_BOOKINGS_QUERY = gql`
  query AllBookings {
    allBookings {
      id
      status
      createdAt
      dateTime
      dateTimeFlexible
      addresses { from to }
      contact { name email phone notes }
      rooms { room floor count }
      items
      company { name contact_email contact_phone }
    }
  }
`;

const APPROVE_BOOKING_MUTATION = gql`
  mutation ApproveBooking($id: ID!) {
    approveBooking(id: $id) { id status }
  }
`;
const REJECT_BOOKING_MUTATION = gql`
  mutation RejectBooking($id: ID!) {
    rejectBooking(id: $id) { id status }
  }
`;
const APPROVED_BOOKINGS_QUERY = gql`
  query ApprovedBookings { approvedBookings { id status createdAt dateTime dateTimeFlexible addresses { from to } contact { name email phone notes } rooms { room floor count } items company { name contact_email contact_phone } } }
`;
const REJECTED_BOOKINGS_QUERY = gql`
  query RejectedBookings { rejectedBookings { id status createdAt dateTime dateTimeFlexible addresses { from to } contact { name email phone notes } rooms { room floor count } items company { name contact_email contact_phone } } }
`;

const Admin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const { data, loading, error, refetch } = useQuery(ALL_BOOKINGS_QUERY, { fetchPolicy: 'network-only' });
  const { data: approvedData, refetch: refetchApproved } = useQuery(APPROVED_BOOKINGS_QUERY, { fetchPolicy: 'network-only' });
  const { data: rejectedData, refetch: refetchRejected } = useQuery(REJECTED_BOOKINGS_QUERY, { fetchPolicy: 'network-only' });
  const [approveBooking] = useMutation(APPROVE_BOOKING_MUTATION);
  const [rejectBooking] = useMutation(REJECT_BOOKING_MUTATION);

  const serviceRequests = data?.allBookings || [];
  const approvedRequests = approvedData?.approvedBookings || [];
  const rejectedRequests = rejectedData?.rejectedBookings || [];

  // Debug: Show raw data and errors
  if (loading) return <div>Loading...</div>;
  if (error) return <pre style={{color: 'red'}}>GraphQL Error: {error.message}</pre>;
  if (!serviceRequests.length && !approvedRequests.length && !rejectedRequests.length) return <div>No bookings found.</div>;

  const stats = {
    totalRequests: 156,
    pendingRequests: 23,
    approvedRequests: 98,
    rejectedRequests: 35,
    totalUsers: 89,
    monthlyGrowth: 12.5
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.addresses.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.addresses.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    if (newStatus === 'approved') {
      await approveBooking({ variables: { id: requestId } });
      await refetch();
      await refetchApproved();
      await refetchRejected();
    } else if (newStatus === 'rejected') {
      await rejectBooking({ variables: { id: requestId } });
      await refetch();
      await refetchApproved();
      await refetchRejected();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage service requests and view analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Growth</p>
                  <p className="text-2xl font-bold">{stats.monthlyGrowth}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('pending')}
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={selectedStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('approved')}
                  size="sm"
                >
                  Approved
                </Button>
                <Button
                  variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('rejected')}
                  size="sm"
                >
                  Rejected
                </Button>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-50">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Request ID: {request.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Status: {request.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(request.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Customer Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {request.contact?.name || 'N/A'}</p>
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {request.contact?.email || 'N/A'}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.contact?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Addresses
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>From:</strong> {request.addresses?.from || 'N/A'}</p>
                          <p><strong>To:</strong> {request.addresses?.to || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Date:</strong> {new Date(request.dateTime).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(request.dateTime).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Items & Rooms</h4>
                        <div className="text-sm">
                          <p><strong>Rooms:</strong> {request.rooms.map(r => `${r.room} (${r.floor})`).join(', ')}</p>
                          <p><strong>Items:</strong> {Object.entries(request.items).map(([item, count]) => `${item} (${count})`).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {request.contact?.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {request.contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {/* Approved bookings table, use approvedData?.approvedBookings */}
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-50">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Request ID: {request.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Status: {request.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Customer Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {request.contact?.name || 'N/A'}</p>
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {request.contact?.email || 'N/A'}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.contact?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Addresses
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>From:</strong> {request.addresses?.from || 'N/A'}</p>
                          <p><strong>To:</strong> {request.addresses?.to || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Date:</strong> {new Date(request.dateTime).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(request.dateTime).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Items & Rooms</h4>
                        <div className="text-sm">
                          <p><strong>Rooms:</strong> {request.rooms.map(r => `${r.room} (${r.floor})`).join(', ')}</p>
                          <p><strong>Items:</strong> {Object.entries(request.items).map(([item, count]) => `${item} (${count})`).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {request.contact?.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {request.contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {/* Rejected bookings table, use rejectedData?.rejectedBookings */}
            <div className="space-y-4">
              {rejectedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-red-50">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Request ID: {request.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Status: {request.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Customer Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {request.contact?.name || 'N/A'}</p>
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {request.contact?.email || 'N/A'}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.contact?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Addresses
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>From:</strong> {request.addresses?.from || 'N/A'}</p>
                          <p><strong>To:</strong> {request.addresses?.to || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Date:</strong> {new Date(request.dateTime).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(request.dateTime).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Items & Rooms</h4>
                        <div className="text-sm">
                          <p><strong>Rooms:</strong> {request.rooms.map(r => `${r.room} (${r.floor})`).join(', ')}</p>
                          <p><strong>Items:</strong> {Object.entries(request.items).map(([item, count]) => `${item} (${count})`).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {request.contact?.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {request.contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.approvedRequests}</p>
                    <p className="text-sm text-muted-foreground">Approved Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{stats.rejectedRequests}</p>
                    <p className="text-sm text-muted-foreground">Rejected Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{((stats.approvedRequests / stats.totalRequests) * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
