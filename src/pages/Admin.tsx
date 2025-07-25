
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

interface ServiceRequest {
  id: string;
  type: 'quote' | 'supplier';
  service: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  addresses: {
    from: string;
    to: string;
  };
  dateTime: string;
  status: 'pending' | 'approved' | 'rejected';
  rooms: Array<{ room: string; floor: string; count: number }>;
  items: Record<string, number>;
  notes: string;
  createdAt: string;
}

const Admin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Mock data for service requests
  const serviceRequests: ServiceRequest[] = [
    {
      id: '1',
      type: 'quote',
      service: 'moving',
      user: { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      addresses: { from: '123 Main St, City A', to: '456 Oak Ave, City B' },
      dateTime: '2024-01-15T10:00:00Z',
      status: 'pending',
      rooms: [{ room: 'Living Room', floor: 'Ground Floor', count: 1 }],
      items: { 'Sofa': 1, 'TV': 1, 'Coffee Table': 1 },
      notes: 'Need help with heavy furniture',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '2',
      type: 'supplier',
      service: 'moving',
      user: { name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
      addresses: { from: '789 Pine St, City C', to: '321 Elm St, City D' },
      dateTime: '2024-01-20T14:00:00Z',
      status: 'approved',
      rooms: [{ room: 'Bedroom', floor: 'First Floor', count: 2 }],
      items: { 'Bed': 2, 'Wardrobe': 1, 'Desk': 1 },
      notes: 'Fragile items need special care',
      createdAt: '2024-01-08T11:00:00Z'
    }
  ];

  const stats = {
    totalRequests: 156,
    pendingRequests: 23,
    approvedRequests: 98,
    rejectedRequests: 35,
    totalUsers: 89,
    monthlyGrowth: 12.5
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.addresses.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.addresses.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (requestId: string, newStatus: 'approved' | 'rejected') => {
    // In a real app, this would update the backend
    console.log(`Updating request ${requestId} to status: ${newStatus}`);
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
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
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
                          <CardTitle className="text-lg">{request.service} - {request.type}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Request ID: {request.id}
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
                          <p><strong>Name:</strong> {request.user.name}</p>
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {request.user.email}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.user.phone}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Addresses
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>From:</strong> {request.addresses.from}</p>
                          <p><strong>To:</strong> {request.addresses.to}</p>
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
                    
                    {request.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>
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
