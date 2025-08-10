
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Address {
  id: string;
  label: string;
  address: string;
}

interface EnhancedAddressSelectionProps {
  data: {
    from: string;
    to: string;
  };
  onUpdate: (addresses: { from: string; to: string }) => void;
}

const EnhancedAddressSelection: React.FC<EnhancedAddressSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [fromType, setFromType] = useState<'saved' | 'custom'>('custom');
  const [toType, setToType] = useState<'saved' | 'custom'>('custom');

  useEffect(() => {
    // Load saved addresses from localStorage or API
    const saved = localStorage.getItem('user-addresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  }, []);

  const handleFromChange = (value: string, type: 'saved' | 'custom') => {
    if (type === 'saved') {
      const address = savedAddresses.find(addr => addr.id === value);
      if (address) {
        onUpdate({ ...data, from: address.address });
      }
    } else {
      onUpdate({ ...data, from: value });
    }
  };

  const handleToChange = (value: string, type: 'saved' | 'custom') => {
    if (type === 'saved') {
      const address = savedAddresses.find(addr => addr.id === value);
      if (address) {
        onUpdate({ ...data, to: address.address });
      }
    } else {
      onUpdate({ ...data, to: value });
    }
  };



  interface AddressInputProps {
    label: string;
    value: string;
    onChange: (value: string, type: 'saved' | 'custom') => void;
    type: 'saved' | 'custom';
    onTypeChange: (type: 'saved' | 'custom') => void;
    placeholder: string;
    color: string;
  }

  const AddressInput: React.FC<AddressInputProps> = ({ 
    label, 
    value, 
    onChange, 
    type,
    onTypeChange, 
    placeholder, 
    color
  }) => (
    <Card className="futuristic-card neon-border border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg gradient-primary">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <Label className="font-semibold text-lg">{label}</Label>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={type === 'saved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange('saved')}
              disabled={savedAddresses.length === 0}
              className={type === 'saved' ? 'gradient-primary text-white' : 'neon-border border-primary/30 hover:border-primary/60'}
            >
              Saved
            </Button>
            <Button
              variant={type === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange('custom')}
              className={type === 'custom' ? 'gradient-primary text-white' : 'neon-border border-primary/30 hover:border-primary/60'}
            >
              Custom
            </Button>
          </div>
          
          {type === 'saved' && savedAddresses.length > 0 ? (
            <Select onValueChange={(value) => onChange(value, 'saved')}>
              <SelectTrigger className="text-base neon-border border-primary/30 hover:border-primary/60 bg-card/50">
                <SelectValue placeholder="Select saved address" />
              </SelectTrigger>
              <SelectContent>
                {savedAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{address.label}</span>
                      <span className="text-sm text-muted-foreground">{address.address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value, 'custom')}
              className="text-base neon-border border-primary/30 hover:border-primary/60 bg-card/50"
            />
          )}
          
          {savedAddresses.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-border/50">
              <p>No saved addresses found.</p>
              <p>Add addresses in your profile to use them here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <AddressInput
        label={t('moving.from')}
        value={data.from}
        onChange={handleFromChange}
        type={fromType}
        onTypeChange={setFromType}
        placeholder="Enter pickup address"
        color="text-green-600"

      />

      <AddressInput
        label={t('moving.to')}
        value={data.to}
        onChange={handleToChange}
        type={toType}
        onTypeChange={setToType}
        placeholder="Enter destination address"
        color="text-red-600"

      />

      <div className="futuristic-card p-6 neon-border border-primary/20">
        <div className="aspect-video bg-card/30 rounded-lg flex items-center justify-center border border-border/50">
          <div className="text-center text-muted-foreground">
            <div className="p-4 rounded-lg gradient-primary/20 inline-block mb-4">
              <MapPin className="h-12 w-12 mx-auto text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Interactive Quantum Map</p>
            <p className="text-sm">Enter addresses manually in the input fields above</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAddressSelection;
