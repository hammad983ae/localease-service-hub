
import React from 'react';
import { Badge } from '@/components/ui/badge';
import ItemCard from './ItemCard';

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

interface RoomSectionProps {
  roomData: RoomData;
  items: RoomItem[];
  itemCounts: Record<string, number>;
  onItemUpdate: (itemId: string, count: number) => void;
}

const RoomSection: React.FC<RoomSectionProps> = ({ 
  roomData, 
  items, 
  itemCounts, 
  onItemUpdate 
}) => {
  const roomName = roomData.room.replace(/([A-Z])/g, ' $1').trim();
  const totalItems = items.reduce((sum, item) => sum + (itemCounts[item.id] || 0), 0);

  return (
    <div className="room-section">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold capitalize liquid-gradient-primary bg-clip-text text-transparent">
          {roomName}
        </h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {roomData.count} room{roomData.count !== 1 ? 's' : ''}
          </Badge>
          {totalItems > 0 && (
            <Badge className="liquid-gradient-secondary text-white text-xs">
              {totalItems} items
            </Badge>
          )}
        </div>
      </div>
      
      <div className="compact-item-grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            count={itemCounts[item.id] || 0}
            onUpdate={onItemUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomSection;
