import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import MovingQuoteForm from './MovingQuoteForm';
import MovingSuppliers from './MovingSuppliers';

interface MovingFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

const MovingFlow: React.FC<MovingFlowProps> = ({ type, onBack }) => {
  const [progress, setProgress] = useState(type === 'quote' ? 50 : 100);

  const renderContent = () => {
    if (type === 'quote') {
      return <MovingQuoteForm />;
    } else {
      return <MovingSuppliers />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {type === 'quote' ? 'Get a Moving Quote' : 'Choose a Supplier'}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <Progress value={progress} />
            </div>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MovingFlow;
