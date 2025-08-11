import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Package, User, Phone, Mail, Home, Package2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface MovingQuoteFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
  onSuccess?: () => void;
}

const MovingQuoteForm: React.FC<MovingQuoteFormProps> = ({ onSubmit, initialData, onSuccess }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.contact?.notes || '');

  const formatDateTimeForBackend = (dateTime: any) => {
    if (!dateTime) return null;
    
    try {
      if (dateTime.date && dateTime.time) {
        const flexibleOptions = ['flexible', 'morning', 'afternoon', 'weekend'];
        if (flexibleOptions.includes(dateTime.time)) {
          // For flexible times, just use the date
          return new Date(dateTime.date);
        }
        // For specific times, combine date and time
        const dateStr = dateTime.date;
        const timeStr = dateTime.time;
        const combinedDateTime = `${dateStr}T${timeStr}:00`;
        return new Date(combinedDateTime);
      } else if (dateTime instanceof Date) {
        return dateTime;
      } else if (typeof dateTime === 'string') {
        return new Date(dateTime);
      }
      return null;
    } catch (error) {
      console.error('Error formatting dateTime:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a quote request.",
        variant: "destructive",
      });
      return;
    }

    // Validate that all required data is present
    if (!initialData.rooms || initialData.rooms.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select rooms and items in the previous step.",
        variant: "destructive",
      });
      return;
    }

    if (!initialData.addresses?.from || !initialData.addresses?.to) {
      toast({
        title: "Missing information",
        description: "Please provide both from and to addresses in the previous step.",
        variant: "destructive",
      });
      return;
    }

    if (!initialData.dateTime) {
      toast({
        title: "Missing information",
        description: "Please select a move date and time in the previous step.",
        variant: "destructive",
      });
      return;
    }

    if (!initialData.contact?.name || !initialData.contact?.email || !initialData.contact?.phone) {
      toast({
        title: "Missing information",
        description: "Please provide your contact information in the previous step.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format the dateTime properly for the backend
      const formattedDateTime = formatDateTimeForBackend(initialData.dateTime);
      
      // Create moving booking data using the collected data
      const bookingData = {
        rooms: initialData.rooms || [],
        items: initialData.items || {}, // This will be converted to Map on backend
        dateTime: formattedDateTime,
        addresses: initialData.addresses,
        contact: {
          name: initialData.contact.name,
          email: initialData.contact.email,
          phone: initialData.contact.phone,
          notes: additionalNotes
        },
        // Include company data if it exists (for Book Services flow)
        ...(initialData.company && { company: initialData.company })
        // Remove hardcoded status - let backend determine based on company selection
      };

      console.log('🔍 Frontend Debug - Submitting booking data:', bookingData);
      console.log('🔍 Frontend Debug - Initial data received:', initialData);
      console.log('🔍 Frontend Debug - Company data:', initialData.company);
      console.log('🔍 Frontend Debug - User data:', user);
      console.log('🔍 Frontend Debug - Auth token:', localStorage.getItem('token'));
      console.log('🔍 Frontend Debug - Formatted dateTime:', formattedDateTime);

      // Submit the booking
      const response = await apiClient.createMovingBooking(bookingData);
      
      if (response) {
        const isCompanyBooking = !!initialData.company;
        toast({
          title: isCompanyBooking ? "Moving booking submitted!" : "Quote request submitted!",
          description: isCompanyBooking 
            ? "Your moving request has been submitted to the company for approval. We'll contact you soon."
            : "Your moving quote request has been submitted and is pending admin approval. We'll notify you once it's reviewed.",
        });
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Also call the original onSubmit if provided
        if (onSubmit) {
          onSubmit(initialData);
        }
      }
    } catch (error: any) {
      console.error('Error submitting quote request:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTime: any) => {
    if (!dateTime) return 'Not specified';
    try {
      if (dateTime.date && dateTime.time) {
        const flexibleOptions = ['flexible', 'morning', 'afternoon', 'weekend'];
        if (flexibleOptions.includes(dateTime.time)) {
          return `${format(new Date(dateTime.date), 'PPP')} - ${dateTime.time}`;
        }
        const dateStr = format(new Date(dateTime.date), 'PPP');
        return `${dateStr} at ${dateTime.time}`;
      } else if (dateTime instanceof Date) {
        return format(dateTime, 'PPP');
      } else if (typeof dateTime === 'string') {
        return format(new Date(dateTime), 'PPP');
      }
      return 'Not specified';
    } catch (error) {
      return 'Not specified';
    }
  };

  const getRoomSummary = (rooms: any[]) => {
    if (!rooms || rooms.length === 0) return 'Not specified';
    return rooms.map(room => `${room.room} (Floor ${room.floor})`).join(', ');
  };

  const getItemsSummary = (items: Record<string, number>) => {
    if (!items || Object.keys(items).length === 0) return 'Not specified';
    return Object.entries(items).map(([item, count]) => `${item}: ${count}`).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Review Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Your Moving Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                From Address
              </Label>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {initialData?.addresses?.from || 'Not specified'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                To Address
              </Label>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {initialData?.addresses?.to || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Move Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Move Date & Time
              </Label>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {formatDateTime(initialData?.dateTime)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Home className="h-4 w-4" />
                Rooms
              </Label>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {getRoomSummary(initialData?.rooms)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Package2 className="h-4 w-4" />
              Items to Move
            </Label>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {getItemsSummary(initialData?.items)}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Contact Information
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-2 rounded">
              <div>
                <span className="text-xs text-muted-foreground">Name:</span>
                <p className="text-sm">{initialData?.contact?.name || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Email:</span>
                <p className="text-sm">{initialData?.contact?.email || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Phone:</span>
                <p className="text-sm">{initialData?.contact?.phone || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes or Special Requirements</Label>
        <Textarea
          id="notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any special requirements, fragile items, or additional information..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Quote Request...
          </>
        ) : (
          'Submit Quote Request'
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground text-center">
        Your quote request will be reviewed by our team. We'll contact you within 24 hours with a detailed quote.
      </p>
    </div>
  );
};

export default MovingQuoteForm; 