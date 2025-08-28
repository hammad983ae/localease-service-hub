import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Home, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface InventoryPageProps {
  selectedFloors: string[];
  selectedRooms: RoomData[];
  items: Record<string, number>;
  onItemsUpdate: (items: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InventoryPage({
  selectedFloors,
  selectedRooms,
  items,
  onItemsUpdate,
  onNext,
  onBack
}: InventoryPageProps) {
  console.log('🔍 InventoryPage: Props received:', { selectedFloors, selectedRooms, items });
  
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showFloorsMenu, setShowFloorsMenu] = useState(false);
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [customItem, setCustomItem] = useState<string>('');

  // Auto-open menu after 1 second delay
  useEffect(() => {
    console.log('🔍 InventoryPage: Component mounted, setting timer for menu');
    const timer = setTimeout(() => {
      console.log('🔍 InventoryPage: Auto-opening floors menu');
      setShowFloorsMenu(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleFloorExpansion = (floor: string) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floor)) {
      newExpanded.delete(floor);
    } else {
      newExpanded.add(floor);
    }
    setExpandedFloors(newExpanded);
  };

  const handleFloorRoomSelect = (floor: string, room: string) => {
    console.log('🔍 InventoryPage: Floor/Room selected:', { floor, room });
    setSelectedFloor(floor);
    setSelectedRoom(room);
  };

  const handleItemsUpdate = (newItems: Record<string, number>) => {
    onItemsUpdate(newItems);
  };

  const getTotalItems = () => {
    return Object.values(items).reduce((sum, count) => sum + count, 0);
  };

  const getRoomCount = (floor: string, room: string) => {
    const roomData = selectedRooms.find(r => r.floor === floor && r.room === room);
    return roomData?.count || 0;
  };

  // Common items for different room types
  const getCommonItemsForRoom = (roomType: string) => {
    const commonItems = [
      { id: 'furniture', label: 'Furniture', icon: '🪑' },
      { id: 'electronics', label: 'Electronics', icon: '📱' },
      { id: 'clothing', label: 'Clothing', icon: '👕' },
      { id: 'books', label: 'Books', icon: '📚' },
      { id: 'kitchenware', label: 'Kitchenware', icon: '🍽️' },
      { id: 'decorations', label: 'Decorations', icon: '🎨' },
      { id: 'tools', label: 'Tools', icon: '🔧' },
      { id: 'storage', label: 'Storage', icon: '📦' },
    ];

    // Filter items based on room type
    if (roomType.toLowerCase().includes('bedroom')) {
      return commonItems.filter(item => ['furniture', 'clothing', 'electronics', 'books'].includes(item.id));
    } else if (roomType.toLowerCase().includes('kitchen')) {
      return commonItems.filter(item => ['furniture', 'kitchenware', 'electronics', 'storage'].includes(item.id));
    } else if (roomType.toLowerCase().includes('bathroom')) {
      return commonItems.filter(item => ['furniture', 'storage'].includes(item.id));
    } else if (roomType.toLowerCase().includes('office')) {
      return commonItems.filter(item => ['furniture', 'electronics', 'books', 'storage'].includes(item.id));
    } else if (roomType.toLowerCase().includes('garage')) {
      return commonItems.filter(item => ['tools', 'storage', 'furniture'].includes(item.id));
    } else {
      return commonItems; // Default for other rooms
    }
  };

  const getItemCount = (itemId: string) => {
    return items[itemId] || 0;
  };

  const updateItemCount = (itemId: string, count: number) => {
    const newItems = { ...items };
    if (count <= 0) {
      delete newItems[itemId];
    } else {
      newItems[itemId] = count;
    }
    onItemsUpdate(newItems);
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      const itemId = `custom_${Date.now()}`;
      const newItems = { ...items, [itemId]: 1 };
      onItemsUpdate(newItems);
      setCustomItem('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Test Header - Always Visible */}
      <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
        <h2 className="text-lg font-bold text-red-800">TESTING - Inventory Page</h2>
        <p className="text-red-700 text-sm">This should always be visible to confirm the component is rendering</p>
        <Button 
          onClick={() => alert('Inventory Page is working!')}
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          Test Button - Click Me!
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose a floor and add your Inventory
        </h1>
        <p className="text-gray-600">
          Select rooms and add items to create your moving inventory
        </p>
      </div>

      {/* Floor & Rooms Menu */}
      <Card className="mb-6">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowFloorsMenu(!showFloorsMenu)}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Floor & Rooms</span>
            {showFloorsMenu ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </CardTitle>
        </CardHeader>
        
        {showFloorsMenu && (
          <CardContent>
            {/* Debug info for floors */}
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <p>Available Floors: {selectedFloors.join(', ') || 'None'}</p>
              <p>Available Rooms: {selectedRooms.map(r => `${r.floor}-${r.room}`).join(', ') || 'None'}</p>
            </div>
            
            <ScrollArea className="max-h-64">
              {selectedFloors.length > 0 ? selectedFloors.map((floor) => (
                <div key={floor} className="mb-4">
                  <div 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFloorExpansion(floor)}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{floor}</span>
                    </div>
                    {expandedFloors.has(floor) ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  
                  {expandedFloors.has(floor) && (
                    <div className="mt-2 ml-4 space-y-2">
                      {selectedRooms
                        .filter(room => room.floor === floor)
                        .map(room => (
                          <div
                            key={`${floor}-${room.room}`}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                              selectedFloor === floor && selectedRoom === room.room
                                ? "bg-blue-100 border border-blue-300"
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => handleFloorRoomSelect(floor, room.room)}
                          >
                            <span className="text-sm">{room.room}</span>
                            <Badge variant="secondary" className="text-xs">
                              {room.count} {room.count === 1 ? 'room' : 'rooms'}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  No floors selected yet. Please go back to the previous step.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>

      {/* Main Content Area */}
      <Card className="mb-20">
        <CardContent className="p-6">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Selected Floor: {selectedFloor || 'None'}</p>
            <p>Selected Room: {selectedRoom || 'None'}</p>
            <p>Total Floors: {selectedFloors.length}</p>
            <p>Total Rooms: {selectedRooms.length}</p>
            <p>Show Floors Menu: {showFloorsMenu ? 'Yes' : 'No'}</p>
          </div>
          
          {selectedFloor && selectedRoom ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Adding inventory to {selectedFloor} - {selectedRoom}
                </h3>
                <p className="text-sm text-gray-600">
                  Select items and quantities for this room
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Room Info Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFloor('');
                        setSelectedRoom('');
                      }}
                      className="p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedRoom}</h4>
                      <p className="text-sm text-gray-600">{selectedFloor} floor</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {getRoomCount(selectedFloor, selectedRoom)} {getRoomCount(selectedFloor, selectedRoom) === 1 ? 'room' : 'rooms'}
                  </Badge>
                </div>

                {/* Inventory Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">Add items to this room:</h5>
                    {getTotalItems() > 0 && (
                      <Badge variant="default" className="bg-blue-600">
                        {getTotalItems()} items selected
                      </Badge>
                    )}
                  </div>
                  
                  {/* Common Items Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {getCommonItemsForRoom(selectedRoom).map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium text-sm">{item.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getItemCount(item.id)} selected
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemCount(item.id, getItemCount(item.id) - 1)}
                            disabled={getItemCount(item.id) <= 0}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-center min-w-[2rem] font-semibold">
                            {getItemCount(item.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemCount(item.id, getItemCount(item.id) + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Item Input */}
                  <div className="border-t pt-4">
                    <h6 className="font-medium text-gray-900 mb-3">Add custom item:</h6>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Laptop, Books, etc."
                        value={customItem}
                        onChange={(e) => setCustomItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                        className="flex-1"
                      />
                      <Button onClick={addCustomItem} disabled={!customItem.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a floor and room to add inventory
              </h3>
              <p className="text-gray-600">
                Choose from the Floor & Rooms menu above to get started
              </p>
              {selectedFloors.length === 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    <strong>No floors selected!</strong> Please go back to the previous step and select floors first.
                  </p>
                </div>
              )}
              {selectedFloors.length > 0 && selectedRooms.length === 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-700 text-sm">
                    <strong>No rooms selected!</strong> Please go back to the previous step and select rooms for your floors.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating + Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-110"
          onClick={() => setIsAddingInventory(true)}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-6 py-2"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={getTotalItems() === 0}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Next
        </Button>
      </div>

      {/* Add Inventory Modal */}
      <Dialog open={isAddingInventory} onOpenChange={setIsAddingInventory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Select a floor and room to quickly add common items:
            </div>
            
            {selectedFloors.map((floor) => (
              <div key={floor} className="space-y-2">
                <h4 className="font-medium text-gray-900">{floor}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRooms
                    .filter(room => room.floor === floor)
                    .map(room => (
                      <Button
                        key={`${floor}-${room.room}`}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => {
                          handleFloorRoomSelect(floor, room.room);
                          setIsAddingInventory(false);
                        }}
                      >
                        {room.room}
                      </Button>
                    ))}
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <Button
                onClick={() => setIsAddingInventory(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
