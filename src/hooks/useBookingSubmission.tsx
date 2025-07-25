
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { gql, useApolloClient } from '@apollo/client';

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
  company?: any;
}

const CREATE_BOOKING_MUTATION = gql`
  mutation CreateMovingBooking(
    $rooms: [RoomInput],
    $items: JSON,
    $dateTime: Date,
    $dateTimeFlexible: String,
    $addresses: AddressInput,
    $contact: ContactInput,
    $company: CompanyInput
  ) {
    createMovingBooking(
      rooms: $rooms,
      items: $items,
      dateTime: $dateTime,
      dateTimeFlexible: $dateTimeFlexible,
      addresses: $addresses,
      contact: $contact,
      company: $company
    ) {
      id
      status
      createdAt
    }
  }
`;

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const client = useApolloClient();

  const formatDateTime = (dateTime: any) => {
    if (!dateTime) return null;
    try {
      if (dateTime.date && dateTime.time) {
        const flexibleOptions = ['flexible', 'morning', 'afternoon', 'weekend'];
        if (flexibleOptions.includes(dateTime.time)) {
          return JSON.stringify({ date: dateTime.date, time: dateTime.time });
        }
        const dateStr = format(new Date(dateTime.date), 'yyyy-MM-dd');
        const timestamp = `${dateStr} ${dateTime.time}:00`;
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
      } else if (dateTime instanceof Date) {
        return dateTime.toISOString();
      } else if (typeof dateTime === 'string') {
        const d = new Date(dateTime);
        if (!isNaN(d.getTime())) return d.toISOString();
        return dateTime;
      }
      return null;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return null;
    }
  };

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
      const formattedDateTime = formatDateTime(data.dateTime);
      let dateTime = null;
      let dateTimeFlexible = null;
      // Determine if flexible or specific
      if (formattedDateTime && formattedDateTime.startsWith('{')) {
        dateTimeFlexible = formattedDateTime;
      } else {
        dateTime = formattedDateTime;
      }
      await client.mutate({
        mutation: CREATE_BOOKING_MUTATION,
        variables: {
          rooms: data.rooms,
          items: data.items,
          dateTime,
          dateTimeFlexible,
          addresses: data.addresses,
          contact: data.contact,
          company: data.company || null
        }
      });
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
