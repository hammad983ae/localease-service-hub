import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import GoogleMaps from '@/components/ui/google-maps';

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

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    console.log('Location selected:', location);
    
    // Parse the address into components
    const addressParts = location.address.split(',').map(part => part.trim());
    
    // Simple parsing - in a real app, you'd want more sophisticated parsing
    const updatedAddress = {
      ...data,
      street: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2] || '',
      zipCode: addressParts[3] || '',
      fullAddress: location.address
    };
    
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
            <Label htmlFor="fullAddress">Full Address (Google Maps Autocomplete)</Label>
            <GoogleMaps
              placeholder="Enter pickup address"
              value={data.fullAddress}
              onChange={(value) => handleChange('fullAddress', value)}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <input
                id="city"
                placeholder="City"
                value={data.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <input
                id="state"
                placeholder="State"
                value={data.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <input
                id="zipCode"
                placeholder="ZIP Code"
                value={data.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted rounded-lg p-4">
        <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive map will show here</p>
            <p className="text-xs">Use the address input above for Google Maps autocomplete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalAddressSelection; 