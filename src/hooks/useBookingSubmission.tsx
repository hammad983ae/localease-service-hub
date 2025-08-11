
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiClient } from '@/api/client';

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

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

      // Map company to match CompanyInput
      let companyInput = null;
      if (data.company) {
        console.log('🔍 useBookingSubmission: Company data found:', data.company);
        companyInput = {
          id: data.company.id || data.company._id, // Use _id as fallback
          name: data.company.name,
          description: data.company.description || '',
          rating: data.company.rating || 0,
          total_reviews: data.company.total_reviews || 0,
          location: data.company.location || data.company.address || '',
          services: data.company.services || [],
          price_range: data.company.price_range || data.company.priceRange || '',
          image_url: data.company.image_url || '',
          contact_phone: data.company.contact_phone || data.company.phone || '',
          contact_email: data.company.contact_email || data.company.email || '',
          companyType: data.company.companyType || 'Moving'
        };
        console.log('🔍 useBookingSubmission: Mapped company input:', companyInput);
      } else {
        console.log('🔍 useBookingSubmission: No company data found in:', data);
      }

      const bookingData = {
        rooms: data.rooms,
        items: data.items,
        dateTime,
        dateTimeFlexible,
        addresses: data.addresses,
        contact: data.contact,
        company: companyInput
      };

      console.log('🔍 useBookingSubmission: Final booking data being sent:', bookingData);
      console.log('🔍 useBookingSubmission: Company in booking data:', companyInput);

      const response = await apiClient.createMovingBooking(bookingData);
      
      toast({
        title: "Moving booking submitted!",
        description: "Your moving request has been submitted successfully. We'll contact you soon.",
      });
      
      return response;
    } catch (error: any) {
      console.error('Error submitting moving booking:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit moving booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitBooking,
    isSubmitting,
  };
};
