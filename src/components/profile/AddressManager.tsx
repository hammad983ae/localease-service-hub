
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ addresses, onAddressesChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: ''
  });
  const { toast } = useToast();

  const predefinedLabels = ['Home', 'Work', 'School', 'Gym', 'Family', 'Other'];

  const handleAddAddress = () => {
    if (!formData.label || !formData.address) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      label: formData.label,
      address: formData.address,
      isDefault: addresses.length === 0
    };

    onAddressesChange([...addresses, newAddress]);
    setFormData({ label: '', address: '' });
    setIsDialogOpen(false);
    
    toast({
      title: 'Success',
      description: 'Address added successfully'
    });
  };

  const handleEditAddress = () => {
    if (!editingAddress || !formData.label || !formData.address) return;

    const updatedAddresses = addresses.map(addr =>
      addr.id === editingAddress.id
        ? { ...addr, label: formData.label, address: formData.address }
        : addr
    );

    onAddressesChange(updatedAddresses);
    setEditingAddress(null);
    setFormData({ label: '', address: '' });
    setIsDialogOpen(false);
    
    toast({
      title: 'Success',
      description: 'Address updated successfully'
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    onAddressesChange(updatedAddresses);
    
    toast({
      title: 'Success',
      description: 'Address deleted successfully'
    });
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    onAddressesChange(updatedAddresses);
    
    toast({
      title: 'Success',
      description: 'Default address updated'
    });
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData({ label: '', address: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({ label: address.label, address: address.address });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-50">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your frequently used addresses</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Select value={formData.label} onValueChange={(value) => setFormData(prev => ({ ...prev, label: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter label" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedLabels.map(label => (
                        <SelectItem key={label} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="custom-label"
                    placeholder="Or enter custom label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingAddress ? handleEditAddress : handleAddAddress}>
                    {editingAddress ? 'Update' : 'Add'} Address
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No saved addresses yet</p>
            <Button onClick={openAddDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{address.label}</span>
                    {address.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(address)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressManager;
