
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomSelectionProps {
  data: any[];
  onUpdate: (rooms: any[]) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [selectedFloor, setSelectedFloor] = useState('ground');

  const floors = [
    { id: 'ground', label: t('floor.ground') },
    { id: 'first', label: t('floor.first') },
    { id: 'second', label: t('floor.second') },
    { id: 'basement', label: t('floor.basement') },
  ];

  const rooms = [
    { id: 'kitchen', label: t('room.kitchen'), icon: '🍳' },
    { id: 'bedroom', label: t('room.bedroom'), icon: '🛏️' },
    { id: 'livingRoom', label: t('room.livingRoom'), icon: '🛋️' },
    { id: 'bathroom', label: t('room.bathroom'), icon: '🚿' },
    { id: 'office', label: t('room.office'), icon: '💼' },
    { id: 'garage', label: t('room.garage'), icon: '🚗' },
  ];

  const getRoomCount = (roomId: string) => {
    const roomData = data.find(r => r.floor === selectedFloor && r.room === roomId);
    return roomData ? roomData.count : 0;
  };

  const updateRoomCount = (roomId: string, count: number) => {
    const newData = data.filter(r => !(r.floor === selectedFloor && r.room === roomId));
    if (count > 0) {
      newData.push({ floor: selectedFloor, room: roomId, count });
    }
    onUpdate(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto">
        {floors.map((floor) => (
          <Button
            key={floor.id}
            variant={selectedFloor === floor.id ? "default" : "outline"}
            onClick={() => setSelectedFloor(floor.id)}
            className="whitespace-nowrap"
          >
            {floor.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {rooms.map((room) => {
          const count = getRoomCount(room.id);
          return (
            <Card key={room.id} className="relative">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{room.icon}</div>
                <div className="text-sm font-medium mb-3">{room.label}</div>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateRoomCount(room.id, Math.max(0, count - 1))}
                    disabled={count === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{count}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateRoomCount(room.id, count + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoomSelection;
