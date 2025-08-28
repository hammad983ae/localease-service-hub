import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, DollarSign } from 'lucide-react';

interface QuoteFormProps {
  showQuoteForm: boolean;
  setShowQuoteForm: (show: boolean) => void;
  sendQuote: (amount: number) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  showQuoteForm,
  setShowQuoteForm,
  sendQuote
}) => {
  const [amount, setAmount] = useState('');

  if (!showQuoteForm) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      sendQuote(numAmount);
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Send Quote
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuoteForm(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Quote Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-1"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuoteForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Send Quote
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
