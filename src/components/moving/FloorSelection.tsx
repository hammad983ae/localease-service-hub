import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloorSelectionProps {
  selectedFloors: string[];
  onFloorsUpdate: (floors: string[]) => void;
  onNext: () => void;
  selectedBuildingType: string | null;
}

const FloorSelection: React.FC<FloorSelectionProps> = ({ 
  selectedFloors, 
  onFloorsUpdate, 
  onNext,
  selectedBuildingType
}) => {
  const [customFloor, setCustomFloor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Common floor/building types with icons and colors
  const floorOptions = [
    { id: 'basement', label: 'Basement', icon: '🏠', color: 'bg-gray-100 hover:bg-gray-200' },
    { id: 'apartment', label: 'Apartment', icon: '🏢', color: 'bg-blue-100 hover:bg-blue-200' },
    { id: 'house', label: 'House', icon: '🏡', color: 'bg-green-100 hover:bg-green-200' },
    { id: 'attic', label: 'Attic', icon: '🪜', color: 'bg-amber-100 hover:bg-amber-200' },
    { id: 'garage', label: 'Garage', icon: '🚗', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { id: 'office', label: 'Office', icon: '💼', color: 'bg-purple-100 hover:bg-purple-200' },
  ];

  const toggleFloor = (floorId: string) => {
    const newSelection = selectedFloors.includes(floorId)
      ? selectedFloors.filter(id => id !== floorId)
      : [...selectedFloors, floorId];
    onFloorsUpdate(newSelection);
  };

  const addCustomFloor = () => {
    if (customFloor.trim() && !selectedFloors.includes(customFloor.trim())) {
      onFloorsUpdate([...selectedFloors, customFloor.trim()]);
      setCustomFloor('');
    }
  };

  const handleCustomFloorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFloor();
    }
  };

  const filteredFloorOptions = floorOptions.filter(floor =>
    floor.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Select floors to move from
        </h2>
        <p className="text-muted-foreground text-lg">
          {selectedBuildingType 
            ? `Building Type: ${selectedBuildingType.charAt(0).toUpperCase() + selectedBuildingType.slice(1)}`
            : 'Choose the floors you need to move from'
          }
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search floor types..."
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>
      </div>

      {/* Floor Options Grid */}
      <div className="mb-8">
        <ScrollArea className="h-96 rounded-lg border p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFloorOptions.map((floor) => {
              const isSelected = selectedFloors.includes(floor.id);
              return (
                <Card
                  key={floor.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                    isSelected 
                      ? "ring-2 ring-blue-500 shadow-lg border-blue-200" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  )}
                  onClick={() => toggleFloor(floor.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">{floor.icon}</div>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleFloor(floor.id)}
                        className="h-5 w-5"
                        aria-label={`Select ${floor.label}`}
                      />
                    </div>
                    <div className="font-semibold text-lg mb-2">{floor.label}</div>
                    <div className={cn(
                      "w-full h-2 rounded-full",
                      floor.color
                    )} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Custom Floor Input */}
      <div className="mb-8">
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-gray-600" />
              Add Custom Floor Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                value={customFloor}
                onChange={(e) => setCustomFloor(e.target.value)}
                placeholder="Add custom floor type..."
                className="flex-1 h-12 text-base"
                onKeyPress={handleCustomFloorKeyPress}
              />
              <Button
                onClick={addCustomFloor}
                disabled={!customFloor.trim()}
                className="h-12 px-6"
                variant="outline"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Floors Display */}
      {selectedFloors.length > 0 && (
        <div className="mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Building className="h-5 w-5" />
                Selected Floors ({selectedFloors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedFloors.map((floor) => (
                  <Badge
                    key={floor}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-2 text-sm"
                  >
                    {floor}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Button */}
      <div className="text-center">
        <Button
          onClick={onNext}
          disabled={selectedFloors.length === 0}
          size="lg"
          className="h-14 px-8 text-lg font-semibold"
        >
          <Home className="h-6 w-6 mr-3" />
          Add Rooms
          {selectedFloors.length > 0 && (
            <Badge variant="secondary" className="ml-3 bg-white text-blue-600">
              {selectedFloors.length} floor{selectedFloors.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </Button>
        {selectedFloors.length === 0 && (
          <p className="text-muted-foreground mt-3">
            Please select at least one floor to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default FloorSelection;
