import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ArrowLeft } from 'lucide-react';

interface RoomItemsPanelProps {
  floorId: string;
  roomId: string;
  items: Record<string, number>;
  onItemsUpdate: (items: Record<string, number>) => void;
  currentRoomCount: number;
  onRoomCountChange: (count: number) => void;
  onBack: () => void;
}

interface RoomItem { id: string; label: string; icon: string; }

const ROOM_ITEMS: Record<string, RoomItem[]> = {
  livingRoom: [
    { id: 'sofa', label: 'Sofa', icon: '🛋️' },
    { id: 'coffeeTable', label: 'Coffee Table', icon: '🪑' },
    { id: 'tv', label: 'TV', icon: '📺' },
    { id: 'armchair', label: 'Armchair', icon: '🪑' },
    { id: 'bookshelf', label: 'Bookshelf', icon: '📚' },
  ],
  bedroom: [
    { id: 'bed', label: 'Bed', icon: '🛏️' },
    { id: 'wardrobe', label: 'Wardrobe', icon: '👗' },
    { id: 'dresser', label: 'Dresser', icon: '🗄️' },
    { id: 'nightstand', label: 'Nightstand', icon: '🪑' },
    { id: 'mirror', label: 'Mirror', icon: '🪞' },
  ],
  kitchen: [
    { id: 'fridge', label: 'Fridge', icon: '❄️' },
    { id: 'washer', label: 'Washer', icon: '🧺' },
    { id: 'microwave', label: 'Microwave', icon: '📱' },
    { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
    { id: 'diningTable', label: 'Dining Table', icon: '🍽️' },
  ],
  bathroom: [
    { id: 'washingMachine', label: 'Washing Machine', icon: '🧺' },
    { id: 'cabinet', label: 'Cabinet', icon: '🗄️' },
    { id: 'mirror', label: 'Bathroom Mirror', icon: '🪞' },
  ],
  office: [
    { id: 'desk', label: 'Desk', icon: '🖥️' },
    { id: 'chair', label: 'Office Chair', icon: '🪑' },
    { id: 'bookshelf', label: 'Bookshelf', icon: '📚' },
    { id: 'fileCabinet', label: 'File Cabinet', icon: '🗄️' },
  ],
  garage: [
    { id: 'toolbox', label: 'Toolbox', icon: '🧰' },
    { id: 'workbench', label: 'Workbench', icon: '🔨' },
    { id: 'shelving', label: 'Shelving Unit', icon: '📦' },
    { id: 'bike', label: 'Bicycle', icon: '🚲' },
  ],
};

export const RoomItemsPanel: React.FC<RoomItemsPanelProps> = ({
  floorId,
  roomId,
  items,
  onItemsUpdate,
  currentRoomCount,
  onRoomCountChange,
  onBack,
}) => {
  const roomItems: RoomItem[] = useMemo(() => ROOM_ITEMS[roomId] || [], [roomId]);

  const setItemCount = (id: string, next: number) => {
    const nextItems = { ...items };
    if (next <= 0) delete nextItems[id];
    else nextItems[id] = next;
    onItemsUpdate(nextItems);
  };

  const getItemCount = (id: string) => items[id] || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to rooms
        </Button>
        <Badge variant="secondary">{floorId} floor</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{roomId.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">How many of this room on this floor?</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => onRoomCountChange(Math.max(0, currentRoomCount - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{currentRoomCount}</span>
              <Button variant="outline" size="icon" onClick={() => onRoomCountChange(currentRoomCount + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roomItems.map((it) => {
              const count = getItemCount(it.id);
              return (
                <Card key={it.id} className="hover:shadow-md transition">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{it.icon}</span>
                        <span className="text-sm font-medium">{it.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="icon" onClick={() => setItemCount(it.id, Math.max(0, count - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{count}</span>
                      <Button variant="outline" size="icon" onClick={() => setItemCount(it.id, count + 1)}>
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
    </div>
  );
};
