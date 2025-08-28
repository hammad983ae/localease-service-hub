import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Truck, Trash2, Move, Quote, Building2, Clock, Package, Home, Wrench, Monitor, TreePine } from 'lucide-react';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (service: string, selectionType: 'quote' | 'supplier', serviceType?: string) => void;
}

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

interface ServiceType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  available: boolean;
}

const services: ServiceOption[] = [
  {
    id: 'moving',
    title: 'Moving',
    description: 'Professional moving services for homes and offices',
    icon: <Move className="w-8 h-8" />,
    color: 'bg-blue-500',
    available: true,
  },
  {
    id: 'disposal',
    title: 'Disposal',
    description: 'Waste removal and disposal services',
    icon: <Trash2 className="w-8 h-8" />,
    color: 'bg-green-500',
    available: true,
  },
  {
    id: 'transport',
    title: 'Transport',
    description: 'Delivery and transportation services',
    icon: <Truck className="w-8 h-8" />,
    color: 'bg-purple-500',
    available: true,
  },
];

const disposalTypes: ServiceType[] = [
  {
    id: 'household',
    title: 'Household Waste',
    description: 'General household items and furniture',
    icon: <Home className="w-6 h-6" />,
    estimatedTime: '2-4 hours',
    available: true,
  },
  {
    id: 'construction',
    title: 'Construction Debris',
    description: 'Building materials and renovation waste',
    icon: <Wrench className="w-6 h-6" />,
    estimatedTime: '4-6 hours',
    available: true,
  },
  {
    id: 'electronic',
    title: 'Electronic Waste',
    description: 'Computers, appliances, and electronics',
    icon: <Monitor className="w-6 h-6" />,
    estimatedTime: '2-3 hours',
    available: true,
  },
  {
    id: 'yard',
    title: 'Yard Waste',
    description: 'Garden debris and landscaping waste',
    icon: <TreePine className="w-6 h-6" />,
    estimatedTime: '3-5 hours',
    available: false,
  },
];

const transportTypes: ServiceType[] = [
  {
    id: 'small-delivery',
    title: 'Small Delivery',
    description: 'Packages and small items',
    icon: <Package className="w-6 h-6" />,
    estimatedTime: 'Same day',
    available: true,
  },
  {
    id: 'furniture',
    title: 'Furniture Transport',
    description: 'Large furniture and appliances',
    icon: <Move className="w-6 h-6" />,
    estimatedTime: '1-2 days',
    available: true,
  },
  {
    id: 'same-day',
    title: 'Same Day Delivery',
    description: 'Urgent delivery services',
    icon: <Clock className="w-6 h-6" />,
    estimatedTime: 'Same day',
    available: true,
  },
  {
    id: 'scheduled',
    title: 'Scheduled Transport',
    description: 'Planned transportation services',
    icon: <Truck className="w-6 h-6" />,
    estimatedTime: '1-3 days',
    available: false,
  },
];

export const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onServiceSelect,
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [step, setStep] = useState<'service' | 'type' | 'selection'>('service');

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    if (serviceId === 'moving') {
      // Moving goes directly to Quote vs Company selection
      setStep('selection');
    } else {
      // Disposal and Transport go to type selection first
      setStep('type');
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedServiceType(typeId);
    setStep('selection');
  };

  const handleFinalSelection = (selectionType: 'quote' | 'supplier') => {
    if (selectedService === 'moving') {
      onServiceSelect('moving', selectionType);
    } else {
      onServiceSelect(selectedService!, selectionType, selectedServiceType!);
    }
  };

  const handleBack = () => {
    if (step === 'selection') {
      if (selectedService === 'moving') {
        setStep('service');
      } else {
        setStep('type');
      }
    } else if (step === 'type') {
      setStep('service');
    }
  };

  const handleClose = () => {
    setSelectedService(null);
    setSelectedServiceType(null);
    setStep('service');
    onClose();
  };

  const getCurrentServiceTypes = () => {
    if (selectedService === 'disposal') return disposalTypes;
    if (selectedService === 'transport') return transportTypes;
    return [];
  };

  const getCurrentService = () => {
    return services.find(s => s.id === selectedService);
  };

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              service.available ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => service.available && handleServiceSelect(service.id)}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className={`p-2 rounded-lg ${service.color} text-white mr-3`}>
                {service.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </div>
              {!service.available && (
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => {
    const serviceTypes = getCurrentServiceTypes();
    const currentService = getCurrentService();

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className={`p-2 rounded-lg ${currentService?.color} text-white`}>
            {currentService?.icon}
          </div>
          <div>
            <h3 className="font-semibold">{currentService?.title}</h3>
            <p className="text-sm text-muted-foreground">Select service type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {serviceTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                type.available ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => type.available && handleTypeSelect(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-muted-foreground">{type.icon}</div>
                    <div>
                      <h4 className="font-medium">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {type.estimatedTime}
                    </span>
                    {!type.available && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderFinalSelection = () => {
    const currentService = getCurrentService();
    const currentServiceType = selectedServiceType 
      ? getCurrentServiceTypes().find(t => t.id === selectedServiceType)
      : null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className={`p-2 rounded-lg ${currentService?.color} text-white`}>
            {currentService?.icon}
          </div>
          <div>
            <h3 className="font-semibold">{currentService?.title}</h3>
            {currentServiceType && (
              <p className="text-sm text-muted-foreground">{currentServiceType.title}</p>
            )}
            <p className="text-sm text-muted-foreground">Choose your preference</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleFinalSelection('quote')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Quote className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">Get a Quote</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed pricing and service information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleFinalSelection('supplier')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">Choose a Company</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect directly with service providers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const getStepTitle = () => {
    if (step === 'service') return 'Select a Service';
    if (step === 'type') return 'Select Service Type';
    return 'Choose Your Preference';
  };

  const shouldShowBackButton = step !== 'service';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {shouldShowBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="flex-1">{getStepTitle()}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {step === 'service' && renderServiceSelection()}
          {step === 'type' && renderTypeSelection()}
          {step === 'selection' && renderFinalSelection()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
