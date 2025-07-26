import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApolloClient, gql } from '@apollo/client';
import { format } from 'date-fns';

const CREATE_TRANSPORT_BOOKING_MUTATION = gql`
  mutation CreateTransportBooking(
    $serviceType: String!,
    $items: [TransportItemInput],
    $dateTime: Date,
    $dateTimeFlexible: String,
    $pickupLocation: LocationInput,
    $dropoffLocation: LocationInput,
    $contact: ContactInput,
    $company: CompanyInput
  ) {
    createTransportBooking(
      serviceType: $serviceType,
      items: $items,
      dateTime: $dateTime,
      dateTimeFlexible: $dateTimeFlexible,
      pickupLocation: $pickupLocation,
      dropoffLocation: $dropoffLocation,
      contact: $contact,
      company: $company
    ) {
      id
      status
      createdAt
    }
  }
`;

export const useTransportBookingSubmission = () => {
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

  const submitTransportBooking = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a transport request.",
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
        companyInput = {
          id: data.company.id,
          name: data.company.name,
          description: data.company.description || '',
          rating: data.company.rating || 0,
          total_reviews: data.company.total_reviews || 0,
          location: data.company.location || '',
          services: data.company.services || [],
          price_range: data.company.price_range || data.company.priceRange || '',
          image_url: data.company.image_url || '',
          contact_phone: data.company.contact_phone || data.company.phone || '',
          contact_email: data.company.contact_email || data.company.email || '',
        };
      }
      const bookingVariables = {
        serviceType: data.serviceType,
        items: data.items,
        dateTime,
        dateTimeFlexible,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        contact: data.contact,
        company: companyInput
      };
      console.log('Submitting transport booking with variables:', bookingVariables);
      await client.mutate({
        mutation: CREATE_TRANSPORT_BOOKING_MUTATION,
        variables: bookingVariables
      });
      toast({
        title: "Transport request submitted successfully!",
        description: "Your transport request has been received. We'll contact you soon.",
      });
      return true;
    } catch (error: any) {
      console.error('Transport booking submission error:', error);
      toast({
        title: "Error submitting transport request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTransportBooking,
    isSubmitting,
  };
}; 