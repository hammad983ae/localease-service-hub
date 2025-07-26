import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useDisposalBookingSubmission } from '@/hooks/useDisposalBookingSubmission';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import DisposalItemSelection from './DisposalItemSelection';
import DisposalDateTimeContactForm from './DisposalDateTimeContactForm';
import DisposalAddressSelection from './DisposalAddressSelection';
import DisposalBookingSummary from './DisposalBookingSummary';
import CompanySelection from '../moving/CompanySelection';

interface DisposalFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

interface DisposalData {
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
}

type Step = 'company' | 'items' | 'datetime-contact' | 'address' | 'summary';

const DisposalFlow: React.FC<DisposalFlowProps> = ({ type, onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>(type === 'supplier' ? 'company' : 'items');
  const [disposalData, setDisposalData] = useState<DisposalData>({
    serviceType: '',
    items: [],
    dateTime: null,
    pickupAddress: { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
    contact: { name: '', email: '', phone: '', notes: '' }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { submitDisposalBooking, isSubmitting } = useDisposalBookingSubmission();
  const { saveServiceSelection } = useServiceSelection();

  // Save service selection when flow starts
  useEffect(() => {
    saveServiceSelection('disposal', type);
  }, [type, saveServiceSelection]);

  const steps: Step[] = type === 'supplier' 
    ? ['company', 'items', 'datetime-contact', 'address', 'summary']
    : ['items', 'datetime-contact', 'address', 'summary'];
  
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

  const updateData = (stepData: Partial<DisposalData>) => {
    setDisposalData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async () => {
    const success = await submitDisposalBooking(disposalData);
    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleCompanySelect = (company: any) => {
    updateData({ company });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'company':
        return <CompanySelection selectedCompany={disposalData.company || null} onCompanySelect={handleCompanySelect} />;
      case 'items':
        return <DisposalItemSelection data={disposalData.items} serviceType={disposalData.serviceType} onUpdate={(items, serviceType) => updateData({ items, serviceType })} />;
      case 'datetime-contact':
        return (
          <DisposalDateTimeContactForm
            dateTimeData={disposalData.dateTime}
            contactData={disposalData.contact}
            onDateTimeUpdate={(dateTime) => updateData({ dateTime })}
            onContactUpdate={(contact) => updateData({ contact })}
          />
        );
      case 'address':
        return <DisposalAddressSelection data={disposalData.pickupAddress} onUpdate={(pickupAddress) => updateData({ pickupAddress })} />;
      case 'summary':
        return <DisposalBookingSummary data={disposalData} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'company': return 'Choose Company';
      case 'items': return 'Select Items to Dispose';
      case 'datetime-contact': return 'Schedule & Contact Details';
      case 'address': return 'Pickup Address';
      case 'summary': return 'Review Booking';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'company':
        return !!disposalData.company;
      case 'items':
        return disposalData.items.length > 0 && disposalData.serviceType;
      case 'datetime-contact':
        return !!disposalData.dateTime && disposalData.contact.name && disposalData.contact.email && disposalData.contact.phone;
      case 'address':
        return disposalData.pickupAddress.fullAddress;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Disposal Request Submitted!</h1>
            <p className="text-muted-foreground">
              Your disposal request has been received. We'll contact you soon to confirm the details.
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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

export default DisposalFlow; 