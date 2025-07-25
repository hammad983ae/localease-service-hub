
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Plus } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface EnhancedAddressSelectionProps {
  data: { from: string; to: string };
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

  const AddressInput = ({ 
    label, 
    value, 
    onChange, 
    type, 
    onTypeChange, 
    placeholder, 
    color 
  }: {
    label: string;
    value: string;
    onChange: (value: string, type: 'saved' | 'custom') => void;
    type: 'saved' | 'custom';
    onTypeChange: (type: 'saved' | 'custom') => void;
    placeholder: string;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className={`h-5 w-5 ${color}`} />
          <Label className="font-medium">{label}</Label>
        </div>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              variant={type === 'saved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange('saved')}
              disabled={savedAddresses.length === 0}
            >
              Saved
            </Button>
            <Button
              variant={type === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange('custom')}
            >
              Custom
            </Button>
          </div>
          
          {type === 'saved' && savedAddresses.length > 0 ? (
            <Select onValueChange={(value) => onChange(value, 'saved')}>
              <SelectTrigger className="text-base">
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
              className="text-base"
            />
          )}
          
          {savedAddresses.length === 0 && (
            <div className="text-sm text-muted-foreground">
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

      <div className="bg-muted rounded-lg p-4">
        <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive map will show here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAddressSelection;
