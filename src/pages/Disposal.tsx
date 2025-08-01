
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trash2, Recycle, Home, Building, Calculator, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DisposalFlow from '@/components/disposal/DisposalFlow';

const Disposal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'quote' | 'supplier' | null>(null);
  const [showServiceTypes, setShowServiceTypes] = useState(false);

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

  const disposalServices = [
    {
      id: 'household',
      icon: Home,
      title: 'Household Junk',
      description: 'Furniture, appliances, and general household items',
      color: 'bg-blue-50 text-blue-600',
      available: true
    },
    {
      id: 'construction',
      icon: Building,
      title: 'Construction Debris',
      description: 'Renovation waste, drywall, and building materials',
      color: 'bg-orange-50 text-orange-600',
      available: true
    },
    {
      id: 'electronic',
      icon: Recycle,
      title: 'Electronic Waste',
      description: 'Computers, TVs, phones, and electronic devices',
      color: 'bg-green-50 text-green-600',
      available: true
    },
    {
      id: 'yard',
      icon: Trash2,
      title: 'Yard Waste',
      description: 'Branches, leaves, grass clippings, and garden debris',
      color: 'bg-emerald-50 text-emerald-600',
      available: false
    }
  ];

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const handleServiceClick = (service: typeof disposalServices[0]) => {
    if (service.available) {
      setSelectedService(service.id);
      setShowServiceTypes(true);
    }
  };

  const handleTypeSelection = (type: 'quote' | 'supplier') => {
    setSelectedType(type);
  };

  if (selectedType) {
    return (
      <DisposalFlow
        type={selectedType}
        onBack={() => {
          setSelectedType(null);
          setShowServiceTypes(false);
          setSelectedService(null);
        }}
      />
    );
  }

  if (showServiceTypes) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowServiceTypes(false)}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Disposal Services</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Hi {firstName}, what type of disposal service do you need?
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose the option that best fits your needs
          </p>
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-muted/30"
            onClick={() => handleTypeSelection('quote')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-blue-50">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Request for Service</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Get an instant quote for your disposal needs
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Provide details about your disposal and receive a detailed quote instantly. 
                Perfect for planning and scheduling your waste removal.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-muted/30"
            onClick={() => handleTypeSelection('supplier')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-50">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Choose Company</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select and book disposal companies directly
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Browse verified disposal companies in your area. 
                Compare services and book the one that fits your needs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-foreground mb-2">Why choose our disposal services?</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Eco-friendly disposal methods</li>
            <li>• Licensed and insured professionals</li>
            <li>• Same-day and scheduled pickups</li>
            <li>• Transparent pricing structure</li>
          </ul>
        </div>
      </div>
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
          <h1 className="text-xl font-bold text-foreground">Disposal Services</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Hi {firstName}, what do you need to dispose of?
        </h2>
        <p className="text-muted-foreground text-sm">
          We handle all types of waste disposal responsibly
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 gap-4">
        {disposalServices.map((service) => (
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
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
                {!service.available && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Pricing Info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Disposal Process</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Schedule a pickup at your convenience</p>
          <p>• Our team handles all the heavy lifting</p>
          <p>• Environmentally responsible disposal and recycling</p>
          <p>• Same-day and next-day service available</p>
        </div>
      </div>

      {/* Environmental Note */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <Recycle className="h-5 w-5 text-green-600" />
          <h3 className="font-medium text-green-800">Eco-Friendly Disposal</h3>
        </div>
        <p className="text-sm text-green-700">
          We prioritize recycling and donation whenever possible to minimize environmental impact.
        </p>
      </div>
    </div>
  );
};

export default Disposal;
