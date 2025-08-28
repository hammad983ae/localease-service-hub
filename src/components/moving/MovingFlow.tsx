import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import MovingSuppliers from './MovingSuppliers';
import Moving3DStep from '@/components/moving3d/Moving3DStep';
import AddressSelection from './AddressSelection';
import DateTimeContactForm from './DateTimeContactForm';
import BookingSummary from './BookingSummary';
import MovingQuoteForm from './MovingQuoteForm';
import FloorSelection from './FloorSelection';
import FloorSelectionModal from './FloorSelectionModal';
import RoomSelection from './RoomSelection';
import InventoryPage from './InventoryPage';
import BuildingTypeModal from './BuildingTypeModal';
import { useBookingSubmission } from '@/hooks/useBookingSubmission';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import { useMultiServiceCart } from '@/contexts/MultiServiceCartContext';
import { ServiceSelectionModal } from '@/components/ServiceSelectionModal';

interface MovingFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

type Step = 'supplier' | 'building-and-floors' | 'rooms' | 'inventory' | 'addresses' | 'datetime-contact' | 'summary' | 'quote-form';

interface MovingData {
  buildingType: string | null;
  floors: string[];
  rooms: any[];
  items: Record<string, number>;
  dateTime: any;
  addresses: { from: string; to: string };
  contact: { name: string; email: string; phone: string; notes: string };
  company?: any;
}

const MovingFlow: React.FC<MovingFlowProps> = ({ type, onBack }) => {
  console.log('🔍 MovingFlow: Initialized with type:', type);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(type === 'supplier' ? 'supplier' : 'building-and-floors');
  console.log('🔍 MovingFlow: Initial currentStep:', currentStep);
  const [movingData, setMovingData] = useState<MovingData>({
    buildingType: null,
    floors: [],
    rooms: [],
    items: {},
    dateTime: null,
    addresses: { from: '', to: '' },
    contact: { name: '', email: '', phone: '', notes: '' }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isBuildingTypeModalOpen, setIsBuildingTypeModalOpen] = useState(false);
  const [isFloorSelectionModalOpen, setIsFloorSelectionModalOpen] = useState(false);

  const { submitBooking, isSubmitting } = useBookingSubmission();
  const { saveServiceSelection } = useServiceSelection();
  const { addItem, openCart } = useMultiServiceCart();

  // Save service selection when flow starts
  React.useEffect(() => {
    saveServiceSelection('moving', type);
  }, [type, saveServiceSelection]);

  // Ensure currentStep is valid after component mounts
  React.useEffect(() => {
    const validSteps = type === 'supplier' 
      ? ['supplier', 'building-and-floors', 'rooms', 'inventory', 'addresses', 'datetime-contact', 'summary']
      : ['building-and-floors', 'rooms', 'inventory', 'addresses', 'datetime-contact', 'quote-form'];
    
    if (!validSteps.includes(currentStep)) {
      setCurrentStep(type === 'supplier' ? 'supplier' : 'building-and-floors');
    }
  }, [type, currentStep]);

  const steps: Step[] = type === 'supplier' 
    ? ['supplier', 'building-and-floors', 'rooms', 'inventory', 'addresses', 'datetime-contact', 'summary']
    : ['building-and-floors', 'rooms', 'inventory', 'addresses', 'datetime-contact', 'quote-form'];
  
  console.log('🔍 MovingFlow: Steps array:', steps);
  console.log('🔍 MovingFlow: Current step index:', steps.indexOf(currentStep));
  
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
    console.log('🔍 MovingFlow: updateData called with:', stepData);
    setMovingData(prev => {
      const newData = { ...prev, ...stepData };
      console.log('🔍 MovingFlow: Updated movingData:', newData);
      return newData;
    });
  };

  const handleSubmit = async () => {
    const success = await submitBooking(movingData);
    if (success) {
      try {
        addItem('moving', null, type, movingData);
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
      setIsSubmitted(true);
    }
  };

  const handleSupplierSelect = (supplier: any) => {
    console.log('🔍 MovingFlow: Supplier selected:', supplier);
    updateData({ company: supplier });
    console.log('🔍 MovingFlow: Updated movingData:', { ...movingData, company: supplier });
    handleNext();
  };

  const handleBuildingTypeSelect = (buildingType: string) => {
    console.log('🔍 MovingFlow: Building type selected:', buildingType);
    updateData({ buildingType });
    console.log('🔍 MovingFlow: Updated movingData:', { ...movingData, buildingType });
    // Don't advance to next step - stay on current step to allow floor selection
  };

  const handleFloorsUpdate = (floors: string[]) => {
    console.log('🔍 MovingFlow: Floors updated:', floors);
    updateData({ floors });
  };

  const handleQuoteSuccess = () => {
    try {
      addItem('moving', null, type, movingData);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
    setIsSubmitted(true);
  };

  const handleServiceSelect = (service: string, selectionType: 'quote' | 'supplier', serviceType?: string) => {
    setIsServiceModalOpen(false);
    
    if (service === 'moving') {
      navigate(`/moving?type=${selectionType}`);
    } else if (service === 'disposal') {
      navigate(`/disposal?serviceType=${serviceType}&type=${selectionType}`);
    } else if (service === 'transport') {
      navigate(`/transport?serviceType=${serviceType}&type=${selectionType}`);
    }
  };

  const renderContent = () => {
    if (isSubmitted) {
      return renderSuccessState();
    }

    switch (currentStep) {
      case 'building-and-floors':
        return (
          <div className="space-y-8">
            {/* Building Type Section */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">Building & Floor Selection</h3>
                <p className="text-muted-foreground">
                  First, select the type of building, then choose the floors you need to move from
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Building Type Card */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardTitle className="text-lg">Building Type</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center space-y-4">
                    {movingData.buildingType ? (
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-blue-700">
                          {movingData.buildingType.charAt(0).toUpperCase() + movingData.buildingType.slice(1)}
                        </div>
                        <Button 
                          onClick={() => setIsBuildingTypeModalOpen(true)}
                          variant="outline"
                          className="w-full"
                        >
                          Change Building Type
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-muted-foreground">No building type selected</div>
                        <Button 
                          onClick={() => setIsBuildingTypeModalOpen(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Select Building Type
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Floors Card */}
                <Card className="border-2 border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="text-lg">Floors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center space-y-4">
                    {movingData.floors.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {movingData.floors.length} floor{movingData.floors.length !== 1 ? 's' : ''} selected
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {movingData.floors.slice(0, 3).map((floor) => (
                            <span key={floor} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {floor}
                            </span>
                          ))}
                          {movingData.floors.length > 3 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              +{movingData.floors.length - 3} more
                            </span>
                          )}
                        </div>
                        <Button 
                          onClick={() => setIsFloorSelectionModalOpen(true)}
                          variant="outline"
                          className="w-full"
                        >
                          Change Floors
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-muted-foreground">No floors selected</div>
                        <Button 
                          onClick={() => setIsFloorSelectionModalOpen(true)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          disabled={!movingData.buildingType}
                        >
                          Select Floors
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Continue Button */}
              {movingData.buildingType && movingData.floors.length > 0 && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleNext} className="px-8 py-3 text-lg">
                    Continue to Room Selection
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      case 'rooms':
        return (
          <RoomSelection
            selectedFloors={movingData.floors}
            selectedRooms={movingData.rooms}
            onRoomsUpdate={(rooms) => updateData({ rooms })}
            onNext={handleNext}
          />
        );
      case 'inventory':
        return (
          <InventoryPage
            selectedFloors={movingData.floors}
            selectedRooms={movingData.rooms}
            items={movingData.items}
            onItemsUpdate={(items) => updateData({ items })}
            onNext={handleNext}
            onBack={handleBack}
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
      case 'quote-form':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Moving Quote Request</h3>
              <p className="text-muted-foreground">
                Review your selections and fill out the final details to submit your quote request.
              </p>
            </div>
            <MovingQuoteForm 
              initialData={movingData}
              onSuccess={handleQuoteSuccess}
            />
          </div>
        );
      case 'supplier':
        return (
          <MovingSuppliers 
            onSupplierSelect={handleSupplierSelect}
            selectedSupplier={movingData.company}
          />
        );
      case 'summary':
        console.log('🔍 MovingFlow: Rendering summary step with data:', movingData);
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

  const renderSuccessState = () => {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          {type === 'quote' ? 'Quote Request Submitted!' : 'Booking Submitted Successfully!'}
        </h3>
        <p className="text-gray-600 mb-4">
          {type === 'quote' 
            ? "Your moving quote request has been submitted and is pending admin approval. We'll contact you within 24 hours with a detailed quote. It has also been added to your cart."
            : "Your moving request has been received. We'll contact you soon to confirm the details. It has also been added to your cart."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onBack} variant="outline">
            Back to Services
          </Button>
          <Button onClick={() => setIsServiceModalOpen(true)} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Service
          </Button>
          <Button onClick={openCart}>
            View Cart
          </Button>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'building-and-floors':
        return !!movingData.buildingType && movingData.floors.length > 0;
      case 'rooms':
        return movingData.rooms.length > 0; // rooms selected for floors
      case 'inventory':
        return Object.keys(movingData.items).length > 0; // at least one item selected
      case 'addresses':
        return !!movingData.addresses.from && !!movingData.addresses.to;
      case 'datetime-contact':
        return !!movingData.dateTime && !!movingData.contact.name && !!movingData.contact.email && !!movingData.contact.phone;
      case 'quote-form':
        return false; // Quote form handles its own submission
      case 'supplier':
        return !!movingData.company;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'building-and-floors':
        return 'Select Building Type & Floors';
      case 'rooms':
        return 'Select Rooms for Each Floor';
      case 'inventory':
        return 'Add Your Inventory';
      case 'addresses':
        return 'Moving Addresses';
      case 'datetime-contact':
        return 'Schedule & Contact Details';
      case 'quote-form':
        return 'Submit Quote Request';
      case 'supplier':
        return 'Choose a Moving Company';
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

            {/* Navigation Buttons - Only show for supplier flow */}
            {!isSubmitted && currentStep !== 'summary' && currentStep !== 'quote-form' && currentStep !== 'building-and-floors' && (
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

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onServiceSelect={handleServiceSelect}
      />

      <BuildingTypeModal
        isOpen={isBuildingTypeModalOpen}
        onClose={() => setIsBuildingTypeModalOpen(false)}
        selectedBuildingType={movingData.buildingType}
        onBuildingTypeSelect={handleBuildingTypeSelect}
      />

      <FloorSelectionModal
        isOpen={isFloorSelectionModalOpen}
        onClose={() => setIsFloorSelectionModalOpen(false)}
        selectedFloors={movingData.floors}
        onFloorsUpdate={handleFloorsUpdate}
      />
    </div>
  );
};

export default MovingFlow;
