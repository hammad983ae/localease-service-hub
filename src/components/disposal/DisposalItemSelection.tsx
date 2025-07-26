import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Recycle, Home, Building, Plus, X } from 'lucide-react';

interface DisposalItem {
  type: string;
  description: string;
  quantity: number;
  photos: string[];
  specialInstructions: string;
}

interface DisposalItemSelectionProps {
  data: DisposalItem[];
  serviceType: string;
  onUpdate: (items: DisposalItem[], serviceType: string) => void;
}

const disposalTypes = [
  { id: 'household', label: 'Household Junk', icon: Home, color: 'bg-blue-50 text-blue-600' },
  { id: 'construction', label: 'Construction Debris', icon: Building, color: 'bg-orange-50 text-orange-600' },
  { id: 'electronic', label: 'Electronic Waste', icon: Recycle, color: 'bg-green-50 text-green-600' },
  { id: 'yard', label: 'Yard Waste', icon: Trash2, color: 'bg-emerald-50 text-emerald-600' }
];

const DisposalItemSelection: React.FC<DisposalItemSelectionProps> = ({ data, serviceType, onUpdate }) => {
  const [items, setItems] = useState<DisposalItem[]>(data);
  const [selectedType, setSelectedType] = useState(serviceType);
  const [newItem, setNewItem] = useState<Partial<DisposalItem>>({
    type: '',
    description: '',
    quantity: 1,
    specialInstructions: ''
  });

  const handleAddItem = () => {
    if (!newItem.type || !newItem.description) return;
    
    const item: DisposalItem = {
      type: newItem.type,
      description: newItem.description,
      quantity: newItem.quantity || 1,
      photos: newItem.photos || [],
      specialInstructions: newItem.specialInstructions || ''
    };
    
    const updatedItems = [...items, item];
    setItems(updatedItems);
    onUpdate(updatedItems, selectedType);
    
    setNewItem({
      type: '',
      description: '',
      quantity: 1,
      specialInstructions: ''
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdate(updatedItems, selectedType);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onUpdate(items, type);
  };

  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Select Disposal Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {disposalTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedType === type.id ? 'ring-2 ring-primary' : 'hover:bg-muted/30'
                }`}
                onClick={() => handleTypeChange(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${type.color}`}>
                      <type.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{type.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items to Dispose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemType">Item Type</Label>
              <select
                id="itemType"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select type...</option>
                {disposalTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the items to be disposed..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Any special handling requirements..."
              value={newItem.specialInstructions}
              onChange={(e) => setNewItem({ ...newItem, specialInstructions: e.target.value })}
            />
          </div>
          
          <Button onClick={handleAddItem} disabled={!newItem.type || !newItem.description}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items to Dispose ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="font-medium">{item.description}</span>
                      <Badge variant="secondary">Qty: {item.quantity}</Badge>
                    </div>
                    {item.specialInstructions && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DisposalItemSelection; 