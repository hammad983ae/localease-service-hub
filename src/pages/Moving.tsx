
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Quote, Users } from 'lucide-react';
import MovingFlow from '@/components/moving/MovingFlow';

const Moving: React.FC = () => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'quote' | 'supplier' | null>(null);

  if (selectedOption) {
    return <MovingFlow type={selectedOption} onBack={() => setSelectedOption(null)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('moving.title')}
        </h1>
      </div>

      <div className="space-y-4">
        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
          onClick={() => setSelectedOption('quote')}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Quote className="h-6 w-6 text-blue-600" />
              </div>
              <span>{t('moving.requestQuote')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get a detailed quote for your moving needs with our comprehensive assessment tool.
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
          onClick={() => setSelectedOption('supplier')}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span>{t('moving.chooseSupplier')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Browse and select from our verified moving service providers in your area.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Moving;
