
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Minus, Home, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IsometricMap, Room } from './IsometricMap';

interface RoomSelectionProps {
  data: any[];
  onUpdate: (rooms: any[]) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [selectedFloors, setSelectedFloors] = useState<string[]>(['ground']);
  const [selectedMapRooms, setSelectedMapRooms] = useState<Room[]>([]);

  const floors = [
    { id: 'basement', label: t('floor.basement'), icon: '🏠', color: 'bg-gray-100' },
    { id: 'ground', label: t('floor.ground'), icon: '🏡', color: 'bg-green-100' },
    { id: 'first', label: t('floor.first'), icon: '🏢', color: 'bg-blue-100' },
    { id: 'second', label: t('floor.second'), icon: '🏗️', color: 'bg-purple-100' },
  ];

  const roomTypes = {
    kitchen: { label: t('room.kitchen'), icon: '👨‍🍳', color: 'from-orange-400 to-red-500' },
    bedroom: { label: t('room.bedroom'), icon: '🛏️', color: 'from-blue-400 to-purple-500' },
    livingRoom: { label: t('room.livingRoom'), icon: '🛋️', color: 'from-green-400 to-blue-500' },
    bathroom: { label: t('room.bathroom'), icon: '🚿', color: 'from-cyan-400 to-blue-500' },
    office: { label: t('room.office'), icon: '💼', color: 'from-gray-400 to-gray-600' },
    garage: { label: t('room.garage'), icon: '🚗', color: 'from-yellow-400 to-orange-500' },
  };

  const toggleFloor = (floorId: string) => {
    setSelectedFloors(prev => 
      prev.includes(floorId) 
        ? prev.filter(f => f !== floorId)
        : [...prev, floorId]
    );
  };

  const getRoomCount = (floor: string, roomId: string) => {
    const roomData = data.find(r => r.floor === floor && r.room === roomId);
    return roomData ? roomData.count : 0;
  };

  const updateRoomCount = (floor: string, roomId: string, count: number) => {
    const newData = data.filter(r => !(r.floor === floor && r.room === roomId));
    if (count > 0) {
      newData.push({ floor, room: roomId, count });
    }
    onUpdate(newData);
  };

  const getTotalRoomsForFloor = (floor: string) => {
    return data.filter(r => r.floor === floor).reduce((sum, r) => sum + r.count, 0);
  };

  const handleMapRoomSelect = (room: Room) => {
    const floorMapping: { [key: number]: string } = {
      0: 'ground',
      1: 'first', 
      2: 'second'
    };
    
    const roomMapping: { [key: string]: string } = {
      'Living Room': 'livingRoom',
      'Bedroom': 'bedroom',
      'Kitchen': 'kitchen',
      'Bathroom': 'bathroom',
      'Office': 'office',
      'Storage': 'garage' // closest match for storage
    };

    const floorId = floorMapping[room.floor] || 'ground';
    const roomId = Object.keys(roomMapping).find(key => room.name.includes(key)) || 'livingRoom';
    const mappedRoomId = roomMapping[roomId] || roomId;
    
    setSelectedMapRooms(prev => {
      const isSelected = prev.some(r => r.id === room.id);
      if (isSelected) {
        // Remove room - decrease count
        const currentCount = getRoomCount(floorId, mappedRoomId);
        updateRoomCount(floorId, mappedRoomId, Math.max(0, currentCount - 1));
        return prev.filter(r => r.id !== room.id);
      } else {
        // Add room - increase count
        const currentCount = getRoomCount(floorId, mappedRoomId);
        updateRoomCount(floorId, mappedRoomId, currentCount + 1);
        // Also make sure the floor is selected
        if (!selectedFloors.includes(floorId)) {
          setSelectedFloors(prev => [...prev, floorId]);
        }
        return [...prev, { ...room, selected: true }];
      }
    });
  };

  const handleMapRoomAdd = (room: Room) => {
    // Don't automatically select newly added rooms, let user click to select
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Select Your Home Layout
        </h2>
        <p className="text-muted-foreground">Choose the floors and rooms you need to move</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Floor Selection */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Select Floors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {floors.map((floor) => {
                  const isSelected = selectedFloors.includes(floor.id);
                  const totalRooms = getTotalRoomsForFloor(floor.id);
                  
                  return (
                    <Card
                      key={floor.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-105",
                        isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                      )}
                      onClick={() => toggleFloor(floor.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">{floor.icon}</div>
                          {isSelected && <Check className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="font-medium text-sm mb-1">{floor.label}</div>
                        {totalRooms > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {totalRooms} room{totalRooms !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Room Selection for Selected Floors */}
          {selectedFloors.map((floorId) => {
            const floor = floors.find(f => f.id === floorId);
            if (!floor) return null;

            return (
              <Card key={floorId} className="border-2 border-purple-100 shadow-lg">
                <CardHeader className={cn("text-white", floor.color === 'bg-gray-100' ? 'bg-gray-500' : 'bg-gradient-to-r from-purple-500 to-pink-600')}>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{floor.icon}</span>
                    <span>Rooms on {floor.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(roomTypes).map(([roomId, room]) => {
                      const count = getRoomCount(floorId, roomId);
                      return (
                        <Card key={roomId} className="relative overflow-hidden">
                          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", room.color)} />
                          <CardContent className="p-4 text-center relative">
                            <div className="text-3xl mb-2">{room.icon}</div>
                            <div className="text-sm font-medium mb-3">{room.label}</div>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50"
                                onClick={() => updateRoomCount(floorId, roomId, Math.max(0, count - 1))}
                                disabled={count === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-bold text-lg">{count}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50"
                                onClick={() => updateRoomCount(floorId, roomId, count + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column - Interactive Floor Plan */}
        <div className="sticky top-4">
          <Card className="border-2 border-emerald-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Interactive Floor Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <IsometricMap 
                mode="room-selection"
                onRoomSelect={handleMapRoomSelect}
                selectedRooms={selectedMapRooms}
                onRoomAdd={handleMapRoomAdd}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
