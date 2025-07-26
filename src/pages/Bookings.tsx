import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Package, Search, Filter, Truck, Trash2, Car } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';
import { cn } from '@/lib/utils';

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

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, loading: isLoading } = useQuery(MY_BOOKINGS_QUERY, {
    skip: !user,
    fetchPolicy: 'network-only',
  });
  const bookings = data?.myBookings || [];

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

  const renderDateTime = (booking) => {
    if (booking.dateTime) {
      return (
        <>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(booking.dateTime)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(booking.dateTime)}</span>
          </div>
        </>
      );
    } else if (booking.dateTimeFlexible) {
      try {
        const flex = JSON.parse(booking.dateTimeFlexible);
        const flexLabels = {
          flexible: "Flexible timing (we'll call to arrange)",
          morning: "Morning (8:00 - 12:00)",
          afternoon: "Afternoon (12:00 - 17:00)",
          weekend: "Weekend preferred"
        };
        return (
          <>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{flex.date ? formatDate(flex.date) : ''}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{flexLabels[flex.time] || flex.time}</span>
            </div>
          </>
        );
      } catch {
        return (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.dateTimeFlexible}</span>
          </div>
        );
      }
    } else {
      return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'moving':
        return Truck;
      case 'disposal':
        return Trash2;
      case 'transport':
        return Car;
      default:
        return Package;
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = (booking.addresses?.from || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.addresses?.to || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Your Bookings
          </h1>
          <p className="text-muted-foreground">
            Track and manage all your service bookings
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'completed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching bookings' : 'No bookings yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by booking a service from the home page'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => {
            const ServiceIcon = Truck; // Default to moving
            return (
              <Card key={booking.id || booking._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-50">
                        <ServiceIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          moving
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Booking #{(booking.id || booking._id || '').toString().slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getStatusColor(booking.status))}
                    >
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {renderDateTime(booking)}
                  <div className="space-y-1">
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">From:</p>
                        <p className="text-muted-foreground">{booking.addresses?.from || 'N/A'}</p>
                      </div>
                    </div>
                    {booking.addresses?.to && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">To:</p>
                          <p className="text-muted-foreground">{booking.addresses?.to || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
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
