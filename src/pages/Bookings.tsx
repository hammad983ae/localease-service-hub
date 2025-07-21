
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin, Clock, Package, Truck, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Bookings: React.FC = () => {
  const { user } = useAuth();

  // Fetch user profile to get the full name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('moving_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'moving': return Truck;
      case 'disposal': return Trash2;
      case 'transport': return Package;
      default: return Calendar;
    }
  };

  const getServiceColor = (serviceType: string) => {
    switch (serviceType) {
      case 'moving': return 'bg-blue-50 text-blue-600';
      case 'disposal': return 'bg-green-50 text-green-600';
      case 'transport': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Your Bookings
        </h1>
        <p className="text-muted-foreground">
          Hi {firstName}, here are all your service bookings
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't made any service bookings yet. Start by exploring our services.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Browse Services
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const ServiceIcon = getServiceIcon(booking.service_type);
            const serviceColor = getServiceColor(booking.service_type);
            
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-full ${serviceColor}`}>
                        <ServiceIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {booking.service_type} Service
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Booking #{booking.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs border", getStatusColor(booking.status))}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Date and Time */}
                  {booking.scheduled_date && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {formatDate(booking.scheduled_date)}
                      </span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span className="text-foreground">
                        {formatTime(booking.scheduled_date)}
                      </span>
                    </div>
                  )}
                  
                  {/* Addresses */}
                  {booking.from_address && (
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">From: </span>
                          <span className="text-foreground">{booking.from_address}</span>
                        </div>
                        {booking.to_address && (
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span className="text-foreground">{booking.to_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Contact Info */}
                  {booking.contact_name && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contact: </span>
                      <span className="text-foreground">{booking.contact_name}</span>
                      {booking.contact_phone && (
                        <span className="text-muted-foreground"> • {booking.contact_phone}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Created Date */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Booked on {formatDate(booking.created_at)}
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
