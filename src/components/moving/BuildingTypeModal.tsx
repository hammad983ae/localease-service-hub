import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building, Building2, Warehouse, Store, MoreHorizontal } from 'lucide-react';

interface BuildingType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BuildingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBuildingType: string | null;
  onBuildingTypeSelect: (buildingType: string) => void;
}

const buildingTypes: BuildingType[] = [
  {
    id: 'home',
    title: 'Home',
    description: 'Single family house or residence',
    icon: <Home className="w-6 h-6" />
  },
  {
    id: 'office',
    title: 'Office',
    description: 'Commercial office space',
    icon: <Building className="w-6 h-6" />
  },
  {
    id: 'apartment',
    title: 'Apartment',
    description: 'Multi-unit residential building',
    icon: <Building2 className="w-6 h-6" />
  },
  {
    id: 'warehouse',
    title: 'Warehouse',
    description: 'Storage or industrial facility',
    icon: <Warehouse className="w-6 h-6" />
  },
  {
    id: 'retail',
    title: 'Retail',
    description: 'Store or shopping center',
    icon: <Store className="w-6 h-6" />
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other building type',
    icon: <MoreHorizontal className="w-6 h-6" />
  }
];

export default function BuildingTypeModal({
  isOpen,
  onClose,
  selectedBuildingType,
  onBuildingTypeSelect
}: BuildingTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(selectedBuildingType);

  useEffect(() => {
    setSelectedType(selectedBuildingType);
  }, [selectedBuildingType]);

  const handleCardClick = (buildingTypeId: string) => {
    setSelectedType(buildingTypeId);
  };

  const handleSelect = () => {
    if (selectedType) {
      onBuildingTypeSelect(selectedType);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Select Building Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          {buildingTypes.map((buildingType) => (
            <Card
              key={buildingType.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedType === buildingType.id
                  ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                  : 'hover:shadow-lg hover:border-gray-300'
              }`}
              onClick={() => handleCardClick(buildingType.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`mx-auto mb-3 p-3 rounded-full ${
                  selectedType === buildingType.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {buildingType.icon}
                </div>
                <h3 className={`font-semibold text-lg mb-2 ${
                  selectedType === buildingType.id
                    ? 'text-blue-700'
                    : 'text-gray-800'
                }`}>
                  {buildingType.title}
                </h3>
                <p className={`text-sm ${
                  selectedType === buildingType.id
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {buildingType.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedType}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
