import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface DisposalAddressSelectionProps {
  data: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
  onUpdate: (address: any) => void;
}

const DisposalAddressSelection: React.FC<DisposalAddressSelectionProps> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: string) => {
    const updatedAddress = { ...data, [field]: value };
    
    // Auto-generate full address
    const parts = [
      updatedAddress.street,
      updatedAddress.city,
      updatedAddress.state,
      updatedAddress.zipCode
    ].filter(Boolean);
    
    updatedAddress.fullAddress = parts.join(', ');
    
    onUpdate(updatedAddress);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span>Pickup Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="Enter street address"
              value={data.street}
              onChange={(e) => handleChange('street', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={data.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={data.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="ZIP Code"
                value={data.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="fullAddress">Full Address</Label>
            <Input
              id="fullAddress"
              placeholder="Full address will be auto-generated"
              value={data.fullAddress}
              onChange={(e) => handleChange('fullAddress', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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

export default DisposalAddressSelection; 