import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFloors: string[];
  onFloorsUpdate: (floors: string[]) => void;
}

const FloorSelectionModal: React.FC<FloorSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedFloors,
  onFloorsUpdate
}) => {
  const [customFloor, setCustomFloor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Common floor/building types with icons and colors
  const floorOptions = [
    { id: 'basement', label: 'Basement', icon: '🏠', color: 'bg-gray-100 hover:bg-gray-200' },
    { id: 'ground', label: 'Ground Floor', icon: '🏡', color: 'bg-green-100 hover:bg-green-200' },
    { id: 'first', label: '1st Floor', icon: '🏢', color: 'bg-blue-100 hover:bg-blue-200' },
    { id: 'second', label: '2nd Floor', icon: '🏗️', color: 'bg-purple-100 hover:bg-purple-200' },
    { id: 'third', label: '3rd Floor', icon: '🏘️', color: 'bg-amber-100 hover:bg-amber-200' },
    { id: 'attic', label: 'Attic', icon: '🪜', color: 'bg-orange-100 hover:bg-orange-200' },
    { id: 'garage', label: 'Garage', icon: '🚗', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { id: 'office', label: 'Office', icon: '💼', color: 'bg-indigo-100 hover:bg-indigo-200' },
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

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Select Floors to Move From
          </DialogTitle>
        </DialogHeader>
        
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
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
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
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleFloor(floor.id)}
                        className="mr-2"
                      />
                      <span className="text-2xl">{floor.icon}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{floor.label}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Custom Floor Input */}
        <div className="mb-6">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              value={customFloor}
              onChange={(e) => setCustomFloor(e.target.value)}
              placeholder="Add custom floor..."
              className="flex-1"
              onKeyPress={handleCustomFloorKeyPress}
            />
            <Button 
              onClick={addCustomFloor}
              disabled={!customFloor.trim()}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Floors Display */}
        {selectedFloors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-center mb-3 text-gray-700">
              Selected Floors ({selectedFloors.length})
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedFloors.map((floor) => (
                <div
                  key={floor}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <span>{floor}</span>
                  <button
                    onClick={() => toggleFloor(floor)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FloorSelectionModal;
