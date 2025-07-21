
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Minus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface ItemSelectionProps {
  data: Record<string, number>;
  rooms: RoomData[];
  onUpdate: (items: Record<string, number>) => void;
}

interface RoomItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface FloorInfo {
  id: string;
  label: string;
  icon: string;
}

const ItemSelection: React.FC<ItemSelectionProps> = ({ data, rooms, onUpdate }) => {
  const { t } = useLanguage();

  const roomItems: Record<string, RoomItem[]> = {
    livingRoom: [
      { id: 'sofa', label: t('item.sofa'), icon: '🛋️', color: 'from-blue-400 to-purple-500' },
      { id: 'coffeeTable', label: 'Coffee Table', icon: '🪑', color: 'from-brown-400 to-yellow-600' },
      { id: 'tv', label: t('item.tv'), icon: '📺', color: 'from-gray-400 to-gray-600' },
      { id: 'armchair', label: 'Armchair', icon: '🪑', color: 'from-green-400 to-blue-500' },
      { id: 'bookshelf', label: 'Bookshelf', icon: '📚', color: 'from-orange-400 to-red-500' },
    ],
    bedroom: [
      { id: 'bed', label: t('item.bed'), icon: '🛏️', color: 'from-blue-400 to-purple-500' },
      { id: 'wardrobe', label: t('item.wardrobe'), icon: '👗', color: 'from-purple-400 to-pink-500' },
      { id: 'dresser', label: 'Dresser', icon: '🗄️', color: 'from-brown-400 to-yellow-600' },
      { id: 'nightstand', label: 'Nightstand', icon: '🪑', color: 'from-green-400 to-blue-500' },
      { id: 'mirror', label: 'Mirror', icon: '🪞', color: 'from-cyan-400 to-blue-500' },
    ],
    kitchen: [
      { id: 'fridge', label: t('item.fridge'), icon: '❄️', color: 'from-cyan-400 to-blue-500' },
      { id: 'washer', label: t('item.washer'), icon: '🧺', color: 'from-blue-400 to-purple-500' },
      { id: 'microwave', label: 'Microwave', icon: '📱', color: 'from-gray-400 to-gray-600' },
      { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️', color: 'from-blue-400 to-cyan-500' },
      { id: 'diningTable', label: 'Dining Table', icon: '🍽️', color: 'from-brown-400 to-yellow-600' },
    ],
    bathroom: [
      { id: 'washingMachine', label: 'Washing Machine', icon: '🧺', color: 'from-blue-400 to-purple-500' },
      { id: 'cabinet', label: 'Cabinet', icon: '🗄️', color: 'from-brown-400 to-yellow-600' },
      { id: 'mirror', label: 'Bathroom Mirror', icon: '🪞', color: 'from-cyan-400 to-blue-500' },
    ],
    office: [
      { id: 'desk', label: 'Desk', icon: '🖥️', color: 'from-gray-400 to-gray-600' },
      { id: 'chair', label: 'Office Chair', icon: '🪑', color: 'from-blue-400 to-purple-500' },
      { id: 'bookshelf', label: 'Bookshelf', icon: '📚', color: 'from-orange-400 to-red-500' },
      { id: 'fileCabinet', label: 'File Cabinet', icon: '🗄️', color: 'from-brown-400 to-yellow-600' },
    ],
    garage: [
      { id: 'toolbox', label: 'Toolbox', icon: '🧰', color: 'from-red-400 to-orange-500' },
      { id: 'workbench', label: 'Workbench', icon: '🔨', color: 'from-brown-400 to-yellow-600' },
      { id: 'shelving', label: 'Shelving Unit', icon: '📦', color: 'from-gray-400 to-gray-600' },
      { id: 'bike', label: 'Bicycle', icon: '🚲', color: 'from-green-400 to-blue-500' },
    ],
  };

  const floors: FloorInfo[] = [
    { id: 'basement', label: t('floor.basement'), icon: '🏠' },
    { id: 'ground', label: t('floor.ground'), icon: '🏡' },
    { id: 'first', label: t('floor.first'), icon: '🏢' },
    { id: 'second', label: t('floor.second'), icon: '🏗️' },
  ];

  // Get unique room types and floors from the rooms array
  const selectedRoomsData = rooms.reduce((acc, room) => {
    const key = `${room.floor}-${room.room}`;
    if (!acc[key]) {
      acc[key] = {
        floor: room.floor,
        room: room.room,
        count: room.count
      };
    }
    return acc;
  }, {} as Record<string, RoomData>);

  const getItemCount = (itemId: string): number => {
    return data[itemId] || 0;
  };

  const updateItemCount = (itemId: string, count: number) => {
    const newData = { ...data };
    if (count > 0) {
      newData[itemId] = count;
    } else {
      delete newData[itemId];
    }
    onUpdate(newData);
  };

  const totalItems = Object.values(data).reduce((sum: number, count: number) => sum + count, 0);

  // Group selected rooms by floor
  const roomsByFloor = Object.values(selectedRoomsData).reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<string, RoomData[]>);

  if (Object.keys(selectedRoomsData).length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Select Your Items
        </h2>
        <p className="text-muted-foreground">Please select rooms in the previous step to see available items</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Select Your Items
        </h2>
        <p className="text-muted-foreground">Choose the items you need to move from each room</p>
        {totalItems > 0 && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Package className="h-4 w-4 mr-2" />
            {totalItems} item{totalItems !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>

      {Object.entries(roomsByFloor).map(([floorId, floorRooms]) => {
        const floor = floors.find(f => f.id === floorId);
        if (!floor) return null;

        return (
          <Card key={floorId} className="border-2 border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{floor.icon}</span>
                <span>{floor.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {floorRooms.map((roomData) => {
                const items = roomItems[roomData.room as keyof typeof roomItems] || [];
                
                return (
                  <div key={`${roomData.floor}-${roomData.room}`}>
                    <h3 className="text-lg font-semibold mb-4 capitalize">
                      {roomData.room.replace(/([A-Z])/g, ' $1').trim()} ({roomData.count} room{roomData.count !== 1 ? 's' : ''})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item) => {
                        const count = getItemCount(item.id);
                        return (
                          <Card key={item.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", item.color)} />
                            <CardContent className="p-4 text-center relative">
                              <div className="text-3xl mb-2">{item.icon}</div>
                              <div className="text-sm font-medium mb-3 min-h-[2.5rem] flex items-center justify-center">{item.label}</div>
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-50"
                                  onClick={() => updateItemCount(item.id, Math.max(0, count - 1))}
                                  disabled={count === 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-bold text-lg">{count}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-green-50"
                                  onClick={() => updateItemCount(item.id, count + 1)}
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
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ItemSelection;
