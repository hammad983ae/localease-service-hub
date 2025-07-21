
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Quote, Users, ArrowRight, Star, Clock, Shield } from 'lucide-react';
import MovingFlow from '@/components/moving/MovingFlow';

const Moving: React.FC = () => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'quote' | 'supplier' | null>(null);

  if (selectedOption) {
    return <MovingFlow type={selectedOption} onBack={() => setSelectedOption(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            {t('moving.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional moving services at your fingertips. Get quotes or find trusted suppliers in minutes.
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">5-Star Rated</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Quick Response</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Insured & Licensed</span>
            </div>
          </div>
        </div>

        {/* Service Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
            onClick={() => setSelectedOption('quote')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Quote className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xl font-bold">{t('moving.requestQuote')}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Get a detailed, personalized quote for your moving needs with our comprehensive assessment tool. Free estimates in minutes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Free detailed assessment
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Instant pricing estimates
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  No hidden fees
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
            onClick={() => setSelectedOption('supplier')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xl font-bold">{t('moving.chooseSupplier')}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Browse and select from our network of verified, highly-rated moving service providers in your area.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Verified professionals only
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Customer reviews & ratings
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Compare prices instantly
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 pt-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Ready to make your move stress-free?
          </h3>
          <p className="text-muted-foreground">
            Join thousands of satisfied customers who trust us with their moving needs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Moving;
