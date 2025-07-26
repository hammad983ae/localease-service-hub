import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Package, Search, Filter, Truck, Trash2, Car, MessageCircle } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground">Track all your service requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Services</option>
            <option value="moving">Moving</option>
            <option value="disposal">Disposal</option>
            <option value="transport">Transport</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'You haven\'t made any bookings yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const ServiceIcon = getServiceIcon(booking.type);
            const addressInfo = getAddressInfo(booking);
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <ServiceIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getServiceLabel(booking.type, booking.serviceType)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-medium">{addressInfo.from}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-medium">{addressInfo.to}</span>
                  </div>
                  {booking.dateTime && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{formatDate(booking.dateTime)}</span>
                    </div>
                  )}
                  {booking.dateTimeFlexible && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">Flexible</span>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
