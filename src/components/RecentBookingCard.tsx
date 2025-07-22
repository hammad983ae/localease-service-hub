
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Trash2, Car, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentBookingCardProps {
  booking: {
    id: string;
    service_type: string;
    status: string;
    created_at: string;
  };
}

const getServiceIcon = (serviceType: string) => {
  switch (serviceType) {
    case 'moving':
      return Truck;
    case 'disposal':
      return Trash2;
    case 'transport':
      return Car;
    default:
      return Sparkles;
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

const RecentBookingCard: React.FC<RecentBookingCardProps> = ({ booking }) => {
  const ServiceIcon = getServiceIcon(booking.service_type);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-blue-50">
            <ServiceIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm capitalize">
              {booking.service_type} Service
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatDate(booking.created_at)}
            </p>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className={cn("text-xs", getStatusColor(booking.status))}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default RecentBookingCard;
