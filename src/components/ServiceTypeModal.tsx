import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calculator, Users } from 'lucide-react';

interface ServiceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'quote' | 'supplier') => void;
  serviceName: string;
  serviceType?: string;
}

export const ServiceTypeModal: React.FC<ServiceTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  serviceName,
  serviceType
}) => {
  const handleSelection = (type: 'quote' | 'supplier') => {
    onSelect(type);
    onClose();
  };

  const getModalTitle = () => {
    if (serviceType) {
      return `${serviceName} Services - ${serviceType}`;
    }
    return `${serviceName} Services`;
  };

  const getModalDescription = () => {
    if (serviceType) {
      return `Choose how you'd like to proceed with your ${serviceType.toLowerCase()} ${serviceName.toLowerCase()} request.`;
    }
    return `Choose how you'd like to proceed with your ${serviceName.toLowerCase()} request.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {getModalTitle()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {getModalDescription()}
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          {/* Quote Option */}
          <button
            onClick={() => handleSelection('quote')}
            className="group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-blue-50 p-6 text-left transition-all duration-300 hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  Get a Quote
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                  Receive detailed pricing and service information
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Company Selection Option */}
          <button
            onClick={() => handleSelection('supplier')}
            className="group relative overflow-hidden rounded-lg border-2 border-green-200 bg-green-50 p-6 text-left transition-all duration-300 hover:border-green-300 hover:bg-green-100 hover:shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                  Choose a Company
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">
                  Browse and select from available service providers
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
