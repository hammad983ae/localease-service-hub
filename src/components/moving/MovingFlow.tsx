
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useBookingSubmission } from '@/hooks/useBookingSubmission';
import RoomSelection from './RoomSelection';
import ItemSelection from './ItemSelection';
import DateTimeSelection from './DateTimeSelection';
import AddressSelection from './AddressSelection';
import ContactForm from './ContactForm';
import BookingSummary from './BookingSummary';

interface MovingFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface MovingData {
  rooms: RoomData[];
  items: Record<string, number>;
  dateTime: any;
  addresses: { from: string; to: string };
  contact: { name: string; email: string; phone: string; notes: string };
}

type Step = 'rooms' | 'items' | 'datetime' | 'addresses' | 'contact' | 'summary';

const MovingFlow: React.FC<MovingFlowProps> = ({ type, onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('rooms');
  const [movingData, setMovingData] = useState<MovingData>({
    rooms: [],
    items: {},
    dateTime: null,
    addresses: { from: '', to: '' },
    contact: { name: '', email: '', phone: '', notes: '' }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { submitBooking, isSubmitting } = useBookingSubmission();

  const steps: Step[] = ['rooms', 'items', 'datetime', 'addresses', 'contact', 'summary'];
  const currentStepIndex = steps.indexOf(currentStep);

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

  const renderStep = () => {
    switch (currentStep) {
      case 'rooms':
        return <RoomSelection data={movingData.rooms} onUpdate={(rooms) => updateData({ rooms })} />;
      case 'items':
        return <ItemSelection data={movingData.items} rooms={movingData.rooms} onUpdate={(items) => updateData({ items })} />;
      case 'datetime':
        return <DateTimeSelection data={movingData.dateTime} onUpdate={(dateTime) => updateData({ dateTime })} />;
      case 'addresses':
        return <AddressSelection data={movingData.addresses} onUpdate={(addresses) => updateData({ addresses })} />;
      case 'contact':
        return <ContactForm data={movingData.contact} onUpdate={(contact) => updateData({ contact })} />;
      case 'summary':
        return <BookingSummary data={movingData} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'rooms': return t('moving.selectRooms');
      case 'items': return t('moving.addItems');
      case 'datetime': return t('moving.dateTime');
      case 'addresses': return t('moving.addresses');
      case 'contact': return t('moving.contact');
      case 'summary': return 'Review Booking';
      default: return '';
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Booking Submitted!</h1>
            <p className="text-muted-foreground">
              Your moving request has been received. We'll contact you soon to confirm the details.
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
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
          >
            {t('common.back')}
          </Button>
          <Button
            onClick={currentStep === 'summary' ? handleSubmit : handleNext}
            disabled={isSubmitting}
          >
            {currentStep === 'summary' ? 
              (isSubmitting ? 'Submitting...' : 'Submit Booking') : 
              t('common.next')
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovingFlow;
