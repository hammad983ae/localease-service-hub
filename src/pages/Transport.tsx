
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Car, Truck, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TransportFlow from '@/components/transport/TransportFlow';
// TODO: Replace Supabase logic with Node.js/MongoDB-based data integration

const Transport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'quote' | 'supplier' | null>(null);

  // Fetch user profile to get the full name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // TODO: Fetch user profile from Node.js/MongoDB backend
      return null;
    },
    enabled: !!user,
  });

  const transportServices = [
    {
      id: 'small-delivery',
      icon: Package,
      title: 'Small Item Delivery',
      description: 'Documents, packages, and small items',
      color: 'bg-blue-50 text-blue-600',
      estimatedTime: '1-2 hours',
      available: true
    },
    {
      id: 'furniture',
      icon: Truck,
      title: 'Furniture Transport',
      description: 'Single furniture pieces and large items',
      color: 'bg-green-50 text-green-600',
      estimatedTime: '2-4 hours',
      available: true
    },
    {
      id: 'same-day',
      icon: Clock,
      title: 'Same Day Delivery',
      description: 'Urgent deliveries within the city',
      color: 'bg-orange-50 text-orange-600',
      estimatedTime: '30 mins - 2 hours',
      available: true
    },
    {
      id: 'scheduled',
      icon: Car,
      title: 'Scheduled Transport',
      description: 'Plan your delivery for a specific time',
      color: 'bg-purple-50 text-purple-600',
      estimatedTime: 'Your choice',
      available: false
    }
  ];

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const handleServiceClick = (service: typeof transportServices[0]) => {
    if (service.available) {
      setSelectedService(service.id);
      // For now, default to quote type - could add a selection dialog later
      setSelectedType('quote');
    }
  };

  if (selectedType) {
    return (
      <TransportFlow
        type={selectedType}
        onBack={() => {
          setSelectedType(null);
          setSelectedService(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="hover:bg-muted/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Transport Services</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Hi {firstName}, what do you need to transport?
        </h2>
        <p className="text-muted-foreground text-sm">
          Fast and reliable delivery services for all your needs
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 gap-4">
        {transportServices.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              service.available ? "hover:bg-muted/30" : "opacity-60 cursor-not-allowed"
            }`}
            onClick={() => handleServiceClick(service)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {service.estimatedTime}
                  </Badge>
                  {!service.available && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Service Features */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Why choose our transport services?</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Real-time tracking for all deliveries</p>
          <p>• Professional and careful handling</p>
          <p>• Flexible pickup and delivery times</p>
          <p>• Insurance coverage for your items</p>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Car className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Transparent Pricing</h3>
        </div>
        <p className="text-sm text-blue-700">
          Get instant quotes based on distance, item size, and delivery time. No hidden fees.
        </p>
      </div>
    </div>
  );
};

export default Transport;
