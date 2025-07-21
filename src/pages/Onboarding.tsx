
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import LanguageToggle from '@/components/LanguageToggle';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { markOnboardingComplete } = useOnboardingStatus();

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
      
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">L</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">
            {t('onboarding.welcome')}
          </h1>
          
          <p className="text-lg text-primary font-medium">
            {t('onboarding.subtitle')}
          </p>
          
          <p className="text-muted-foreground leading-relaxed">
            {t('onboarding.description')}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleGetStarted}
            className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {t('onboarding.getStarted')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
