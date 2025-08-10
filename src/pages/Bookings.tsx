import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Package, Search, Filter, Truck, Trash2, Car, MessageCircle, Plus, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';

const MY_BOOKINGS_QUERY = gql`
  query MyBookings {
    myBookings {
      id
      status
      createdAt
      dateTime
      dateTimeFlexible
      addresses { from to }
    }
  }
`;

const MY_DISPOSAL_BOOKINGS_QUERY = gql`
  query MyDisposalBookings {
    myDisposalBookings {
      id
      status
      createdAt
      dateTime
      dateTimeFlexible
      serviceType
      pickupAddress { fullAddress }
    }
  }
`;

const MY_TRANSPORT_BOOKINGS_QUERY = gql`
  query MyTransportBookings {
    myTransportBookings {
      id
      status
      createdAt
      dateTime
      dateTimeFlexible
      serviceType
      pickupLocation { fullAddress }
      dropoffLocation { fullAddress }
    }
  }
`;

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const { data: movingData, loading: movingLoading } = useQuery(MY_BOOKINGS_QUERY, {
    skip: !user,
    fetchPolicy: 'network-only',
  });
  
  const { data: disposalData, loading: disposalLoading } = useQuery(MY_DISPOSAL_BOOKINGS_QUERY, {
    skip: !user,
    fetchPolicy: 'network-only',
  });
  
  const { data: transportData, loading: transportLoading } = useQuery(MY_TRANSPORT_BOOKINGS_QUERY, {
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const movingBookings = movingData?.myBookings || [];
  const disposalBookings = disposalData?.myDisposalBookings || [];
  const transportBookings = transportData?.myTransportBookings || [];

  // Combine all bookings with type information
  const allBookings = [
    ...movingBookings.map((booking: any) => ({ ...booking, type: 'moving' })),
    ...disposalBookings.map((booking: any) => ({ ...booking, type: 'disposal' })),
    ...transportBookings.map((booking: any) => ({ ...booking, type: 'transport' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'moving': return Truck;
      case 'disposal': return Trash2;
      case 'transport': return Car;
      default: return Package;
    }
  };

  const getServiceLabel = (type: string, serviceType?: string) => {
    switch (type) {
      case 'moving': return 'Moving Service';
      case 'disposal': 
        switch (serviceType) {
          case 'household': return 'Household Disposal';
          case 'construction': return 'Construction Disposal';
          case 'electronic': return 'Electronic Disposal';
          case 'yard': return 'Yard Disposal';
          default: return 'Disposal Service';
        }
      case 'transport':
        switch (serviceType) {
          case 'small-delivery': return 'Small Delivery';
          case 'furniture': return 'Furniture Transport';
          case 'same-day': return 'Same Day Delivery';
          default: return 'Transport Service';
        }
      default: return 'Service';
    }
  };

  const getAddressInfo = (booking: any) => {
    switch (booking.type) {
      case 'moving':
        return {
          from: booking.addresses?.from || 'N/A',
          to: booking.addresses?.to || 'N/A'
        };
      case 'disposal':
        return {
          from: booking.pickupAddress?.fullAddress || 'N/A',
          to: 'Disposal Center'
        };
      case 'transport':
        return {
          from: booking.pickupLocation?.fullAddress || 'N/A',
          to: booking.dropoffLocation?.fullAddress || 'N/A'
        };
      default:
        return { from: 'N/A', to: 'N/A' };
    }
  };

  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesService = serviceFilter === 'all' || booking.type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const isLoading = movingLoading || disposalLoading || transportLoading;

  // Calculate stats
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
  const completedBookings = allBookings.filter(b => b.status === 'approved').length;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="LocalEase | My Bookings" description="Track and manage your LocalEase bookings in one place." />
      <div className="saas-layout">
        {/* Compact Header */}
        <div className="bg-card border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">My Bookings</h1>
            <p className="text-sm text-muted-foreground">Track and manage your service bookings</p>
          </div>
          <Button 
            size="sm"
            className="btn-primary"
            onClick={() => navigate('/moving')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-blue-600">Total</p>
              <p className="text-lg font-bold text-blue-900">{totalBookings}</p>
            </div>
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-yellow-600">Pending</p>
              <p className="text-lg font-bold text-yellow-900">{pendingBookings}</p>
            </div>
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-green-600">Completed</p>
              <p className="text-lg font-bold text-green-900">{completedBookings}</p>
            </div>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Services</option>
            <option value="moving">Moving</option>
            <option value="disposal">Disposal</option>
            <option value="transport">Transport</option>
          </select>
        </div>
      </div>

      {/* Compact Bookings List */}
      <div className="px-4 py-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-xs text-gray-500 mb-3">
              {allBookings.length === 0 
                ? "You haven't made any bookings yet."
                : "No bookings match your current filters."
              }
            </p>
            <Button 
              size="sm"
              className="btn-primary"
              onClick={() => navigate('/moving')}
            >
              <Plus className="mr-1 h-3 w-3" />
              Make Your First Booking
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBookings.map((booking, index) => {
              const ServiceIcon = getServiceIcon(booking.type);
              const addressInfo = getAddressInfo(booking);
              
              return (
                <div 
                  key={booking.id} 
                  className="bg-card rounded-lg border border-border p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <ServiceIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {getServiceLabel(booking.type, booking.serviceType)}
                        </h3>
                        <Badge className="text-xs border">
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>#{booking.id}</span>
                        <span>{formatDate(booking.createdAt)}</span>
                        {booking.dateTime && (
                          <span>{formatTime(booking.dateTime)}</span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-foreground/80">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{addressInfo.from}</span>
                        </div>
                        {addressInfo.to !== 'N/A' && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{addressInfo.to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Bookings;
