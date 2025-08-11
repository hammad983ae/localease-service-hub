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
    const allowed = new Set(['residential', 'utility', 'outdoor']);
    return ROOM_CATALOG.filter(r => allowed.has(r.category));
  }, []);

  const priorityOrder = ['livingRoom','bedroom','kitchen','bathroom','diningRoom','guestRoom','childrensRoom','homeOffice','laundryRoom','garage','pantryStorage','utilityRoom','hallwayCorridor','balcony','patioTerrace','gardenShed','atticLoft','basementCellar','coldStorage','libraryReadingRoom','musicRoomStudio','gymFitnessRoom'];
  const order = (id: string) => {
    const idx = priorityOrder.indexOf(id);
    return idx === -1 ? 999 : idx;
  };

  const filtered = rooms
    .filter(r => r.label.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => order(a.id) - order(b.id) || a.label.localeCompare(b.label));

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search rooms..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {filtered.map((room) => (
          <Card
            key={room.id}
            className="cursor-pointer hover:shadow-md transition rounded-xl hover:border-primary/30"
            onClick={() => onSelectRoom(room.id)}
            role="button"
            aria-label={`Select ${room.label}`}
          >
            <CardContent className="p-5 flex items-start gap-3 min-h-[96px]">
              <span className="text-2xl" aria-hidden>{room.icon}</span>
              <div className="min-w-0">
                <div className="font-semibold text-base leading-tight truncate">{room.label}</div>
                <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5 rounded-full">{floorId} floor</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
