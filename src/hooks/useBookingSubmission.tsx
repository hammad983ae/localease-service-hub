
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface MovingData {
  rooms: RoomData[];
  items: Record<string, number>;
  dateTime: any;
  addresses: { from: string; to: string };
  contact: { name: string; email: string; phone: string; notes: string };
}

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const submitBooking = async (data: MovingData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a booking.",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // Create the main booking
      const { data: booking, error: bookingError } = await supabase
        .from('moving_bookings')
        .insert({
          user_id: user.id,
          service_type: 'moving',
          date_time: data.dateTime,
          from_address: data.addresses.from,
          to_address: data.addresses.to,
          contact_name: data.contact.name,
          contact_email: data.contact.email,
          contact_phone: data.contact.phone,
          notes: data.contact.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      const bookingId = booking.id;

      // Insert room data
      if (data.rooms.length > 0) {
        const roomInserts = data.rooms.map(room => ({
          booking_id: bookingId,
          floor: room.floor,
          room: room.room,
          count: room.count
        }));

        const { error: roomsError } = await supabase
          .from('booking_rooms')
          .insert(roomInserts);

        if (roomsError) {
          throw roomsError;
        }
      }

      // Insert item data
      const itemEntries = Object.entries(data.items).filter(([_, quantity]) => quantity > 0);
      if (itemEntries.length > 0) {
        const itemInserts = itemEntries.map(([itemId, quantity]) => ({
          booking_id: bookingId,
          item_id: itemId,
          quantity: quantity
        }));

        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(itemInserts);

        if (itemsError) {
          throw itemsError;
        }
      }

      toast({
        title: "Booking submitted successfully!",
        description: "Your moving request has been received. We'll contact you soon.",
      });

      return true;
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitBooking,
    isSubmitting
  };
};
