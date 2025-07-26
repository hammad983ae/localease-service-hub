
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calculator, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovingFlow from '@/components/moving/MovingFlow';
import { useQuery } from '@tanstack/react-query';
// TODO: Replace Supabase logic with Node.js/MongoDB-based data integration
import { useServiceSelection } from '@/hooks/useServiceSelection';

const Moving: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'quote' | 'supplier' | null>(null);
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

  // Check if user has a previous selection
  useEffect(() => {
    const checkPreviousSelection = async () => {
      if (!user) return;
      
      const selection = await getServiceSelection('moving');
      if (selection) {
        setSelectedType(selection.selection_type as 'quote' | 'supplier');
      }
    };
    
    checkPreviousSelection();
  }, [user, getServiceSelection]);

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const handleTypeSelection = (type: 'quote' | 'supplier') => {
    setSelectedType(type);
  };

  if (selectedType) {
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
                <CardTitle className="text-lg">Get a Quote</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get an instant estimate for your move
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Provide details about your move and receive a detailed quote instantly. 
              Perfect for planning and budgeting your relocation.
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
                <CardTitle className="text-lg">Book Service</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Book professional movers directly
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Connect with verified moving professionals in your area. 
              Schedule your move and get expert help every step of the way.
            </p>
          </CardContent>
        </Card>
      </div>

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
