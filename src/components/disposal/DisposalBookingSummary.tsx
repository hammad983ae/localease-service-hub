import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, MapPin, User, Package } from 'lucide-react';

interface DisposalBookingSummaryProps {
  data: {
    serviceType: string;
    items: Array<{
      type: string;
      description: string;
      quantity: number;
      photos: string[];
      specialInstructions: string;
    }>;
    dateTime: any;
    pickupAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      fullAddress: string;
    };
    contact: {
      name: string;
      email: string;
      phone: string;
      notes: string;
    };
    company?: any;
  };
}

const DisposalBookingSummary: React.FC<DisposalBookingSummaryProps> = ({ data }) => {
  const disposalTypes = {
    'household': 'Household Junk',
    'construction': 'Construction Debris',
    'electronic': 'Electronic Waste',
    'yard': 'Yard Waste'
  };

  const flexibleOptions = {
    'flexible': 'Flexible timing (we\'ll call to arrange)',
    'morning': 'Morning (8:00 - 12:00)',
    'afternoon': 'Afternoon (12:00 - 17:00)',
    'weekend': 'Weekend preferred'
  };

  const formatDateTime = () => {
    if (!data.dateTime) return 'Not specified';
    
    if (data.dateTime.time && flexibleOptions[data.dateTime.time as keyof typeof flexibleOptions]) {
      return `${data.dateTime.date ? new Date(data.dateTime.date).toLocaleDateString() : 'Date'} - ${flexibleOptions[data.dateTime.time as keyof typeof flexibleOptions]}`;
    }
    
    if (data.dateTime.date && data.dateTime.time) {
      const date = new Date(data.dateTime.date);
      return `${date.toLocaleDateString()} at ${data.dateTime.time}`;
    }
    
    return 'Not specified';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Disposal Request Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Type */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Service Type</span>
            </div>
            <Badge variant="outline">
              {disposalTypes[data.serviceType as keyof typeof disposalTypes] || data.serviceType}
            </Badge>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium mb-2">Items to Dispose ({data.items.length})</h3>
            <div className="space-y-2">
              {data.items.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="mr-2">{item.type}</Badge>
                      <span className="font-medium">{item.description}</span>
                    </div>
                    <Badge variant="outline">Qty: {item.quantity}</Badge>
                  </div>
                  {item.specialInstructions && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.specialInstructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{formatDateTime()}</p>
        </CardContent>
      </Card>

      {/* Pickup Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Pickup Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.pickupAddress.fullAddress || 'Address not specified'}</p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name:</span>
            <span className="text-sm font-medium">{data.contact.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium">{data.contact.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Phone:</span>
            <span className="text-sm font-medium">{data.contact.phone}</span>
          </div>
          {data.contact.notes && (
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground">Notes:</span>
              <p className="text-sm mt-1">{data.contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company (if selected) */}
      {data.company && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Selected Company</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{data.company.name}</p>
                <p className="text-sm text-muted-foreground">{data.company.description}</p>
              </div>
              <Badge variant="outline">{data.company.price_range || 'Price on request'}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DisposalBookingSummary; 