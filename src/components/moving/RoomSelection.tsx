
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Home, MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomSelectionProps {
  selectedFloors: string[];
  selectedRooms: Array<{
    floor: string;
    room: string;
    count: number;
  }>;
  onRoomsUpdate: (rooms: Array<{ floor: string; room: string; count: number }>) => void;
  onNext: () => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ 
  selectedFloors, 
  selectedRooms, 
  onRoomsUpdate, 
  onNext 
}) => {
  const [customRoom, setCustomRoom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFloor, setActiveFloor] = useState<string>('');

  // Set first floor as active when component mounts
  useEffect(() => {
    if (selectedFloors.length > 0 && !activeFloor) {
      setActiveFloor(selectedFloors[0]);
    }
  }, [selectedFloors, activeFloor]);

  // Common room types with icons and colors
  const commonRooms = [
    { id: 'bedroom', label: 'Bedroom', icon: '🛏️', color: 'bg-blue-100 hover:bg-blue-200' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳', color: 'bg-orange-100 hover:bg-orange-200' },
    { id: 'balcony', label: 'Balcony', icon: '🌇', color: 'bg-green-100 hover:bg-green-200' },
    { id: 'toilet', label: 'Toilet', icon: '🚽', color: 'bg-gray-100 hover:bg-gray-200' },
    { id: 'bathroom', label: 'Bathroom', icon: '🚿', color: 'bg-cyan-100 hover:bg-cyan-200' },
    { id: 'basement', label: 'Basement', icon: '🏠', color: 'bg-amber-100 hover:bg-amber-200' },
  ];

  const getRoomCount = (floor: string, roomId: string) => {
    const roomData = selectedRooms.find(r => r.floor === floor && r.room === roomId);
    return roomData ? roomData.count : 0;
  };

  const toggleRoom = (floor: string, roomId: string) => {
    const currentCount = getRoomCount(floor, roomId);
    const newRooms = selectedRooms.filter(r => !(r.floor === floor && r.room === roomId));
    
    if (currentCount === 0) {
      // Add room
      newRooms.push({ floor, room: roomId, count: 1 });
    } else {
      // Remove room
      if (currentCount > 1) {
        newRooms.push({ floor, room: roomId, count: currentCount - 1 });
      }
    }
    
    onRoomsUpdate(newRooms);
  };

  const addCustomRoom = () => {
    if (customRoom.trim() && activeFloor) {
      const newRooms = [...selectedRooms];
      const existingRoom = newRooms.find(r => r.floor === activeFloor && r.room === customRoom.trim());
      
      if (existingRoom) {
        existingRoom.count += 1;
      } else {
        newRooms.push({ floor: activeFloor, room: customRoom.trim(), count: 1 });
      }
      
      onRoomsUpdate(newRooms);
      setCustomRoom('');
    }
  };

  const handleCustomRoomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomRoom();
    }
  };

  const getTotalRoomsForFloor = (floor: string) => {
    return selectedRooms.filter(r => r.floor === floor).reduce((sum, r) => sum + r.count, 0);
  };

  const getTotalSelectedRooms = () => {
    return selectedRooms.reduce((sum, r) => sum + r.count, 0);
  };

  const filteredCommonRooms = commonRooms.filter(room =>
    room.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-h-screen">
      <div className="text-center space-y-4 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose floor and add your rooms
        </h2>
        <p className="text-muted-foreground">
          Select rooms for: <span className="font-semibold text-blue-600">{activeFloor || 'No floor selected'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Visual Floor Map */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Selected Floors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {selectedFloors.map((floor) => {
                  const isActive = floor === activeFloor;
                  const totalRooms = getTotalRoomsForFloor(floor);
                  
                  return (
                    <Card
                      key={floor}
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-105",
                        isActive ? "ring-2 ring-blue-500 shadow-lg bg-blue-50" : "hover:shadow-md"
                      )}
                      onClick={() => setActiveFloor(floor)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-2xl">🏠</div>
                            <div className="font-medium text-sm capitalize">{floor}</div>
                          </div>
                          {totalRooms > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {totalRooms} room{totalRooms !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        {isActive && (
                          <div className="mt-2 w-full h-1 bg-blue-500 rounded-full"></div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Room Selection */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Room Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and Custom Room Input */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search room types..."
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Input
                    value={customRoom}
                    onChange={(e) => setCustomRoom(e.target.value)}
                    placeholder="Add custom room type..."
                    className="flex-1"
                    onKeyPress={handleCustomRoomKeyPress}
                  />
                  <Button
                    onClick={addCustomRoom}
                    disabled={!customRoom.trim() || !activeFloor}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Common Room Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {filteredCommonRooms.map((room) => {
                  const count = getRoomCount(activeFloor, room.id);
                  const isSelected = count > 0;
                  
                  return (
                    <Card
                      key={room.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-105",
                        isSelected ? "ring-2 ring-purple-500 shadow-lg" : "hover:shadow-md"
                      )}
                      onClick={() => toggleRoom(activeFloor, room.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{room.icon}</div>
                        <div className="text-sm font-medium mb-2">{room.label}</div>
                        <div className="flex items-center justify-center space-x-2">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleRoom(activeFloor, room.id)}
                            className="h-4 w-4"
                          />
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Navigation Button */}
              <div className="flex justify-end">
                <Button
                  onClick={onNext}
                  disabled={getTotalSelectedRooms() === 0}
                  size="lg"
                  className="h-12 px-6"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Add Inventory
                  {getTotalSelectedRooms() > 0 && (
                    <Badge variant="secondary" className="ml-3 bg-white text-purple-600">
                      {getTotalSelectedRooms()} room{getTotalSelectedRooms() !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
