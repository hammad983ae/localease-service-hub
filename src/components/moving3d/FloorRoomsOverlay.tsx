import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROOM_CATALOG } from '@/data/roomTypes';

interface FloorRoomsOverlayProps {
  floorId: string;
  onSelectRoom: (roomId: string) => void;
}

export const FloorRoomsOverlay: React.FC<FloorRoomsOverlayProps> = ({ floorId, onSelectRoom }) => {
  const [query, setQuery] = useState('');

  const rooms = useMemo(() => {
    const allowed = new Set(['residential', 'utility']);
    return ROOM_CATALOG.filter(r => allowed.has(r.category));
  }, []);

  const filtered = rooms.filter(r => r.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search rooms..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((room) => (
          <Card
            key={room.id}
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => onSelectRoom(room.id)}
            role="button"
            aria-label={`Select ${room.label}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-xl">{room.icon}</span>
              <div>
                <div className="font-medium">{room.label}</div>
                <Badge variant="secondary" className="mt-1">{floorId} floor</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
