import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle, Package, Car, Truck, Clock } from 'lucide-react';
import { useTransportBookingSubmission } from '@/hooks/useTransportBookingSubmission';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import CompanySelection from '../moving/CompanySelection';
import GoogleMaps from '@/components/ui/google-maps';

interface TransportFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

interface TransportData {
  serviceType: string;
  items: Array<{
    type: string;
    description: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      weight: number;
    };
    quantity: number;
    specialInstructions: string;
    fragile: boolean;
    insuranceRequired: boolean;
  }>;
  dateTime: any;
  pickupLocation: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
    instructions: string;
  };
  dropoffLocation: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
    instructions: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  company?: any;
}

type Step = 'company' | 'service' | 'items' | 'datetime-contact' | 'locations' | 'summary';

const TransportFlow: React.FC<TransportFlowProps> = ({ type, onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>(type === 'supplier' ? 'company' : 'service');
  const [transportData, setTransportData] = useState<TransportData>({
    serviceType: '',
    items: [],
    dateTime: null,
    pickupLocation: { street: '', city: '', state: '', zipCode: '', fullAddress: '', instructions: '' },
    dropoffLocation: { street: '', city: '', state: '', zipCode: '', fullAddress: '', instructions: '' },
    contact: { name: '', email: '', phone: '', notes: '' }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { submitTransportBooking, isSubmitting } = useTransportBookingSubmission();
  const { saveServiceSelection } = useServiceSelection();

  // Save service selection when flow starts
  useEffect(() => {
    saveServiceSelection('transport', type);
  }, [type, saveServiceSelection]);

  const steps: Step[] = type === 'supplier' 
    ? ['company', 'service', 'items', 'datetime-contact', 'locations', 'summary']
    : ['service', 'items', 'datetime-contact', 'locations', 'summary'];
  
  const currentStepIndex = steps.indexOf(currentStep);

  const transportServices = [
    { id: 'small-delivery', label: 'Small Item Delivery', icon: Package, estimatedTime: '1-2 hours' },
    { id: 'furniture', label: 'Furniture Transport', icon: Truck, estimatedTime: '2-4 hours' },
    { id: 'same-day', label: 'Same Day Delivery', icon: Clock, estimatedTime: '30 mins - 2 hours' }
  ];

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    } else {
      onBack();
    }
  };

  const updateData = (stepData: Partial<TransportData>) => {
    setTransportData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    const success = await submitTransportBooking(transportData);
    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleCompanySelect = (company: any) => {
    updateData({ company });
  };

  const handleServiceSelect = (serviceType: string) => {
    updateData({ serviceType });
  };

  const handleContactChange = (field: string, value: string) => {
    updateData({ contact: { ...transportData.contact, [field]: value } });
  };

  const handleDateTimeChange = (dateTime: any) => {
    updateData({ dateTime });
  };

  const handleLocationChange = (type: 'pickup' | 'dropoff', field: string, value: string) => {
    const location = type === 'pickup' ? transportData.pickupLocation : transportData.dropoffLocation;
    const updatedLocation = { ...location, [field]: value };
    
    // Auto-generate full address
    const parts = [
      updatedLocation.street,
      updatedLocation.city,
      updatedLocation.state,
      updatedLocation.zipCode
    ].filter(Boolean);
    updatedLocation.fullAddress = parts.join(', ');
    
    updateData({
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: updatedLocation
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'company':
        return <CompanySelection selectedCompany={transportData.company || null} onCompanySelect={handleCompanySelect} service={'Transport'} />;
      case 'service':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Transport Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {transportServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      transportData.serviceType === service.id ? 'ring-2 ring-primary' : 'hover:bg-muted/30'
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                            <service.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{service.label}</p>
                            <p className="text-sm text-muted-foreground">{service.estimatedTime}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'items':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Transport Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Item Description</Label>
                  <Textarea placeholder="Describe the items to be transported..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fragile Items</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <Label>Insurance Required</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'datetime-contact':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      placeholder="Enter your full name"
                      value={transportData.contact.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={transportData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={transportData.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={transportData.contact.notes}
                    onChange={(e) => handleContactChange('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'locations':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pickup Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Address (Google Maps Autocomplete)</Label>
                  <GoogleMaps
                    placeholder="Enter pickup address"
                    value={transportData.pickupLocation.fullAddress}
                    onChange={(value) => handleLocationChange('pickup', 'fullAddress', value)}
                    onLocationSelect={(location) => {
                      console.log('Pickup location selected:', location);
                      // Parse the address into components
                      const addressParts = location.address.split(',').map(part => part.trim());
                      const updatedLocation = {
                        ...transportData.pickupLocation,
                        street: addressParts[0] || '',
                        city: addressParts[1] || '',
                        state: addressParts[2] || '',
                        zipCode: addressParts[3] || '',
                        fullAddress: location.address
                      };
                      updateData({ pickupLocation: updatedLocation });
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      placeholder="City"
                      value={transportData.pickupLocation.city}
                      onChange={(e) => handleLocationChange('pickup', 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      placeholder="State"
                      value={transportData.pickupLocation.state}
                      onChange={(e) => handleLocationChange('pickup', 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      placeholder="ZIP Code"
                      value={transportData.pickupLocation.zipCode}
                      onChange={(e) => handleLocationChange('pickup', 'zipCode', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Any pickup instructions..."
                    value={transportData.pickupLocation.instructions}
                    onChange={(e) => handleLocationChange('pickup', 'instructions', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drop-off Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Address (Google Maps Autocomplete)</Label>
                  <GoogleMaps
                    placeholder="Enter drop-off address"
                    value={transportData.dropoffLocation.fullAddress}
                    onChange={(value) => handleLocationChange('dropoff', 'fullAddress', value)}
                    onLocationSelect={(location) => {
                      console.log('Dropoff location selected:', location);
                      // Parse the address into components
                      const addressParts = location.address.split(',').map(part => part.trim());
                      const updatedLocation = {
                        ...transportData.dropoffLocation,
                        street: addressParts[0] || '',
                        city: addressParts[1] || '',
                        state: addressParts[2] || '',
                        zipCode: addressParts[3] || '',
                        fullAddress: location.address
                      };
                      updateData({ dropoffLocation: updatedLocation });
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      placeholder="City"
                      value={transportData.dropoffLocation.city}
                      onChange={(e) => handleLocationChange('dropoff', 'city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      placeholder="State"
                      value={transportData.dropoffLocation.state}
                      onChange={(e) => handleLocationChange('dropoff', 'state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      placeholder="ZIP Code"
                      value={transportData.dropoffLocation.zipCode}
                      onChange={(e) => handleLocationChange('dropoff', 'zipCode', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Any drop-off instructions..."
                    value={transportData.dropoffLocation.instructions}
                    onChange={(e) => handleLocationChange('dropoff', 'instructions', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Transport Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Service Type</span>
                <Badge variant="outline">
                  {transportServices.find(s => s.id === transportData.serviceType)?.label || transportData.serviceType}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contact:</span>
                  <span className="text-sm font-medium">{transportData.contact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pickup:</span>
                  <span className="text-sm font-medium">{transportData.pickupLocation.fullAddress || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Drop-off:</span>
                  <span className="text-sm font-medium">{transportData.dropoffLocation.fullAddress || 'Not specified'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'company': return 'Choose Company';
      case 'service': return 'Select Transport Service';
      case 'items': return 'Transport Items';
      case 'datetime-contact': return 'Schedule & Contact Details';
      case 'locations': return 'Pickup & Drop-off Locations';
      case 'summary': return 'Review Request';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'company':
        return !!transportData.company;
      case 'service':
        return !!transportData.serviceType;
      case 'items':
        return true; // Simplified for now
      case 'datetime-contact':
        return transportData.contact.name && transportData.contact.email && transportData.contact.phone;
      case 'locations':
        return transportData.pickupLocation.fullAddress && transportData.dropoffLocation.fullAddress;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Transport Request Submitted!</h1>
            <p className="text-muted-foreground">
              Your transport request has been received. We'll contact you soon to confirm the details.
            </p>
          </div>
          <Button onClick={onBack} variant="outline" className="backdrop-blur-sm">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              {getStepTitle()}
            </h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex space-x-2 mb-8 max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="min-h-[400px] mb-8">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="backdrop-blur-sm"
          >
            {t('common.back')}
          </Button>
          <Button
            onClick={currentStep === 'summary' ? handleSubmit : handleNext}
            disabled={isSubmitting || !canProceed()}
            className="backdrop-blur-sm"
          >
            {currentStep === 'summary' ? 
              (isSubmitting ? 'Submitting...' : 'Submit Request') : 
              t('common.next')
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransportFlow; 