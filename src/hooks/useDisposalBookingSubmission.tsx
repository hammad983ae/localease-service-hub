import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApolloClient, gql } from '@apollo/client';
import { format } from 'date-fns';

const CREATE_DISPOSAL_BOOKING_MUTATION = gql`
  mutation CreateDisposalBooking(
    $serviceType: String!,
    $items: [DisposalItemInput],
    $dateTime: Date,
    $dateTimeFlexible: String,
    $pickupAddress: PickupAddressInput,
    $contact: ContactInput,
    $company: CompanyInput
  ) {
    createDisposalBooking(
      serviceType: $serviceType,
      items: $items,
      dateTime: $dateTime,
      dateTimeFlexible: $dateTimeFlexible,
      pickupAddress: $pickupAddress,
      contact: $contact,
      company: $company
    ) {
      id
      status
      createdAt
    }
  }
`;

export const useDisposalBookingSubmission = () => {
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

  const submitDisposalBooking = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a disposal request.",
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
        pickupAddress: data.pickupAddress,
        contact: data.contact,
        company: companyInput
      };
      console.log('Submitting disposal booking with variables:', bookingVariables);
      await client.mutate({
        mutation: CREATE_DISPOSAL_BOOKING_MUTATION,
        variables: bookingVariables
      });
      toast({
        title: "Disposal request submitted successfully!",
        description: "Your disposal request has been received. We'll contact you soon.",
      });
      return true;
    } catch (error: any) {
      console.error('Disposal booking submission error:', error);
      toast({
        title: "Error submitting disposal request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitDisposalBooking,
    isSubmitting,
  };
}; 