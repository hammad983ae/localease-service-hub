import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Home, Building } from 'lucide-react';
import { IsometricMap, Room } from './IsometricMap';

interface EnhancedAddressSelectionProps {
  onAddressesUpdate: (addresses: any) => void;
  initialData?: any;
}

interface AddressState {
  from: string;
  to: string;
  fromFloor: string;
  toFloor: string;
}

const EnhancedAddressSelection: React.FC<EnhancedAddressSelectionProps> = ({
  onAddressesUpdate,
  initialData
}) => {
  const [addresses, setAddresses] = useState<AddressState>({
    from: initialData?.fromAddress || '',
    to: initialData?.toAddress || '',
    fromFloor: initialData?.fromFloor || '',
    toFloor: initialData?.toFloor || '',
  });
  const [selectedMapRooms, setSelectedMapRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (initialData) {
      setAddresses({
        from: initialData?.fromAddress || '',
        to: initialData?.toAddress || '',
        fromFloor: initialData?.fromFloor || '',
        toFloor: initialData?.toFloor || '',
      });
    }
  }, [initialData]);

  const handleAddressChange = (field: keyof AddressState, value: string) => {
    setAddresses(prev => ({
      ...prev,
      [field]: value
    }));
    onAddressesUpdate({
      ...addresses,
      [field]: value
    });
  };

  const handleMapRoomSelect = (room: Room) => {
    // Placeholder for map room selection logic
    console.log("Selected room from map:", room);
    setSelectedMapRooms(prev => {
      const isSelected = prev.some(r => r.id === room.id);
      if (isSelected) {
        return prev.filter(r => r.id !== room.id);
      } else {
        return [...prev, { ...room, selected: true }];
      }
    });
  };

  const handleMapRoomAdd = (room: Room) => {
    // Placeholder for map room addition logic
    console.log("Added room from map:", room);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
          Select Your Addresses
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose your moving locations with our interactive map
        </p>
      </div>

      {/* Interactive Map */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span>Interactive Location Selector</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <IsometricMap 
            mode="address-selection"
            onRoomSelect={handleMapRoomSelect}
            selectedRooms={selectedMapRooms}
            onRoomAdd={handleMapRoomAdd}
          />
        </CardContent>
      </Card>

      {/* Address Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Address */}
        <Card className="glass-card hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Home className="h-5 w-5" />
              <span>From Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromAddress" className="text-sm font-medium text-foreground/80">
                Current Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fromAddress"
                  value={addresses.from}
                  onChange={(e) => handleAddressChange('from', e.target.value)}
                  placeholder="Enter your current address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* To Address */}
        <Card className="glass-card hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <MapPin className="h-5 w-5" />
              <span>To Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="toAddress" className="text-sm font-medium text-foreground/80">
                Destination Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="toAddress"
                  value={addresses.to}
                  onChange={(e) => handleAddressChange('to', e.target.value)}
                  placeholder="Enter your destination address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floor Selection */}
      <Card className="glass-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Building className="h-5 w-5" />
            <span>Floor Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">From Floor</Label>
              <Select value={addresses.fromFloor} onValueChange={(value) => handleAddressChange('fromFloor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ground">Ground Floor</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5+">5th Floor or Higher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">To Floor</Label>
              <Select value={addresses.toFloor} onValueChange={(value) => handleAddressChange('toFloor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ground">Ground Floor</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5+">5th Floor or Higher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAddressSelection;
