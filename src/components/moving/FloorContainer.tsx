
import React from 'react';
import RoomSection from './RoomSection';

interface FloorInfo {
  id: string;
  label: string;
  icon: string;
}

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface RoomItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface FloorContainerProps {
  floor: FloorInfo;
  rooms: RoomData[];
  roomItems: Record<string, RoomItem[]>;
  itemCounts: Record<string, number>;
  onItemUpdate: (itemId: string, count: number) => void;
}

const FloorContainer: React.FC<FloorContainerProps> = ({ 
  floor, 
  rooms, 
  roomItems, 
  itemCounts, 
  onItemUpdate 
}) => {
  const totalFloorItems = rooms.reduce((total, room) => {
    const items = roomItems[room.room] || [];
    return total + items.reduce((sum, item) => sum + (itemCounts[item.id] || 0), 0);
  }, 0);

  return (
    <div className="floor-container floating-element">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full liquid-gradient-primary flex items-center justify-center text-white text-xl shadow-lg">
            {floor.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{floor.label}</h3>
            <p className="text-sm text-muted-foreground">
              {rooms.length} room type{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {totalFloorItems > 0 && (
          <div className="liquid-gradient-secondary text-white px-4 py-2 rounded-full text-sm font-medium">
            {totalFloorItems} items selected
          </div>
        )}
      </div>

      <div className="space-y-4">
        {rooms.map((room) => {
          const items = roomItems[room.room as keyof typeof roomItems] || [];
          if (items.length === 0) return null;
          
          return (
            <RoomSection
              key={`${room.floor}-${room.room}`}
              roomData={room}
              items={items}
              itemCounts={itemCounts}
              onItemUpdate={onItemUpdate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FloorContainer;
