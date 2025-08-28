
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MovingFlow from '@/components/moving/MovingFlow';
import { ServiceTypeModal } from '@/components/ServiceTypeModal';
import { useQuery } from '@tanstack/react-query';
// TODO: Replace Supabase logic with Node.js/MongoDB-based data integration
import { useServiceSelection } from '@/hooks/useServiceSelection';

const Moving: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'quote' | 'supplier' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { getServiceSelection } = useServiceSelection();

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

  // Check URL parameters and previous selection
  useEffect(() => {
    const checkSelection = async () => {
      if (!user) return;
      
      // First check URL parameters (from service selection modal)
      const urlType = searchParams.get('type');
      if (urlType && (urlType === 'quote' || urlType === 'supplier')) {
        console.log('🔍 Moving page: Found URL parameter type:', urlType);
        setSelectedType(urlType as 'quote' | 'supplier');
        return;
      }
      
      // Fall back to checking previous selection
      const selection = await getServiceSelection('moving');
      if (selection) {
        console.log('🔍 Moving page: Found previous selection:', selection);
        setSelectedType(selection.selection_type as 'quote' | 'supplier');
      } else {
        console.log('🔍 Moving page: No previous selection found');
      }
    };
    
    checkSelection();
  }, [user, getServiceSelection, searchParams]);

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const handleTypeSelection = (type: 'quote' | 'supplier') => {
    console.log('🔍 Moving page: handleTypeSelection called with type:', type);
    setSelectedType(type);
    setIsModalOpen(false);
    console.log('🔍 Moving page: selectedType set to:', type);
  };

  if (selectedType) {
    console.log('🔍 Moving page: Rendering MovingFlow with type:', selectedType);
    return (
      <MovingFlow
        type={selectedType}
        onBack={() => setSelectedType(null)}
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
          <h1 className="text-xl font-bold text-foreground">Moving Services</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Hi {firstName}, what type of moving service do you need?
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose the option that best fits your needs
        </p>
      </div>

      {/* Service Selection Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90"
        >
          Select Service Type
        </Button>
      </div>

            {/* Service Type Modal */}
      <ServiceTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleTypeSelection}
        serviceName="Moving"
      />

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">Why choose our moving services?</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Professional and experienced movers</li>
          <li>• Transparent pricing with no hidden fees</li>
          <li>• Fully insured and licensed</li>
          <li>• 24/7 customer support</li>
        </ul>
      </div>
    </div>
  );
};

export default Moving;
