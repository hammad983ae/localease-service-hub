
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, Home, Package, User } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  service_type: string;
  date_time: string;
  from_address: string;
  to_address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  status: string;
  created_at: string;
  booking_rooms: Array<{
    floor: string;
    room: string;
    count: number;
  }>;
  booking_items: Array<{
    item_id: string;
    quantity: number;
  }>;
}

const Bookings: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('moving_bookings')
          .select(`
            *,
            booking_rooms (
              floor,
              room,
              count
            ),
            booking_items (
              item_id,
              quantity
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          setBookings(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalRooms = (booking: Booking) => {
    return booking.booking_rooms?.reduce((sum, room) => sum + room.count, 0) || 0;
  };

  const getTotalItems = (booking: Booking) => {
    return booking.booking_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.bookings')}
        </h1>
        <p className="text-muted-foreground">
          Manage your service bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No bookings found. Create your first booking to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{booking.service_type} Service</span>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date and Time */}
                {booking.date_time && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(booking.date_time), 'PPP')}
                    </span>
                    <Clock className="h-4 w-4 text-muted-foreground ml-4" />
                    <span className="text-sm">
                      {format(new Date(booking.date_time), 'p')}
                    </span>
                  </div>
                )}

                {/* Addresses */}
                <div className="space-y-2">
                  {booking.from_address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-green-600">From: </span>
                        <span className="text-sm">{booking.from_address}</span>
                      </div>
                    </div>
                  )}
                  {booking.to_address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-red-600">To: </span>
                        <span className="text-sm">{booking.to_address}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.contact_name}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">{booking.contact_phone}</span>
                </div>

                {/* Rooms and Items Summary */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getTotalRooms(booking)} rooms</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getTotalItems(booking)} items</span>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}

                {/* Booking Date */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Booked on {format(new Date(booking.created_at), 'PPP')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
