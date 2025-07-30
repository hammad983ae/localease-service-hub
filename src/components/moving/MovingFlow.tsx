import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import MovingQuoteForm from './MovingQuoteForm';
import MovingSuppliers from './MovingSuppliers';
import RoomSelection from './RoomSelection';
import ItemSelection from './ItemSelection';
import AddressSelection from './AddressSelection';
import DateTimeContactForm from './DateTimeContactForm';
import BookingSummary from './BookingSummary';
import { useBookingSubmission } from '@/hooks/useBookingSubmission';
import { useServiceSelection } from '@/hooks/useServiceSelection';

interface MovingFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

type Step = 'supplier' | 'rooms' | 'items' | 'addresses' | 'datetime-contact' | 'summary';

interface MovingData {
  rooms: any[];
  items: Record<string, number>;
  dateTime: any;
  addresses: { from: string; to: string };
  contact: { name: string; email: string; phone: string; notes: string };
  company?: any;
}

const MovingFlow: React.FC<MovingFlowProps> = ({ type, onBack }) => {
  const [currentStep, setCurrentStep] = useState<Step>(type === 'supplier' ? 'supplier' : 'rooms');
  const [movingData, setMovingData] = useState<MovingData>({
    rooms: [],
    items: {},
    dateTime: null,
    addresses: { from: '', to: '' },
    contact: { name: '', email: '', phone: '', notes: '' }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { submitBooking, isSubmitting } = useBookingSubmission();
  const { saveServiceSelection } = useServiceSelection();

  // Save service selection when flow starts
  React.useEffect(() => {
    saveServiceSelection('moving', type);
  }, [type, saveServiceSelection]);

  const steps: Step[] = type === 'supplier' 
    ? ['supplier', 'rooms', 'items', 'addresses', 'datetime-contact', 'summary']
    : ['rooms', 'items', 'addresses', 'datetime-contact', 'summary'];
  
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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

  const updateData = (stepData: Partial<MovingData>) => {
    setMovingData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    const success = await submitBooking(movingData);
    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleSupplierSelect = (supplier: any) => {
    updateData({ company: supplier });
    handleNext();
  };

  const renderContent = () => {
    if (isSubmitted) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Booking Submitted Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your moving request has been received. We'll contact you soon to confirm the details.
          </p>
          <Button onClick={onBack} className="mt-4">
            Back to Services
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 'supplier':
        return (
          <MovingSuppliers 
            onSupplierSelect={handleSupplierSelect}
            selectedSupplier={movingData.company}
          />
        );
      case 'rooms':
        return (
          <RoomSelection 
            data={movingData.rooms}
            onUpdate={(rooms) => updateData({ rooms })}
          />
        );
      case 'items':
        return (
          <ItemSelection 
            data={movingData.items}
            rooms={movingData.rooms}
            onUpdate={(items) => updateData({ items })}
          />
        );
      case 'addresses':
        return (
          <AddressSelection 
            data={movingData.addresses}
            onUpdate={(addresses) => updateData({ addresses })}
          />
        );
      case 'datetime-contact':
        return (
          <DateTimeContactForm
            dateTimeData={movingData.dateTime}
            contactData={movingData.contact}
            onDateTimeUpdate={(dateTime) => updateData({ dateTime })}
            onContactUpdate={(contact) => updateData({ contact })}
          />
        );
      case 'summary':
        return (
          <div className="space-y-6">
            <BookingSummary data={movingData} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking'}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'supplier':
        return !!movingData.company;
      case 'rooms':
        return movingData.rooms.length > 0;
      case 'items':
        return Object.keys(movingData.items).length > 0;
      case 'addresses':
        return movingData.addresses.from && movingData.addresses.to;
      case 'datetime-contact':
        return !!movingData.dateTime && movingData.contact.name && movingData.contact.email && movingData.contact.phone;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'supplier':
        return 'Choose a Moving Company';
      case 'rooms':
        return 'Select Rooms & Floors';
      case 'items':
        return 'Select Items to Move';
      case 'addresses':
        return 'Moving Addresses';
      case 'datetime-contact':
        return 'Schedule & Contact Details';
      case 'summary':
        return 'Booking Summary';
      default:
        return 'Moving Service';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto py-8">
        <Card className="max-w-6xl mx-auto shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {getStepTitle()}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mb-6">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
            
            <div className="min-h-[600px]">
              {renderContent()}
            </div>

            {/* Navigation Buttons */}
            {!isSubmitted && currentStep !== 'summary' && (
              <div className="flex justify-between items-center pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                
                <div className="flex gap-2">
                  {currentStep === 'supplier' && movingData.company && (
                    <Button 
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentStep !== 'supplier' && canProceed() && (
                    <Button 
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MovingFlow;
