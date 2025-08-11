import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Layers3, Package } from 'lucide-react';
import { ROOM_CATALOG } from '@/data/roomTypes';
import { Building } from './Building';
import { FloorRoomsOverlay } from './FloorRoomsOverlay';
import { RoomItemsPanel } from './RoomItemsPanel';

export interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface Moving3DStepProps {
  rooms: RoomData[];
  items: Record<string, number>;
  onRoomsUpdate: (rooms: RoomData[]) => void;
  onItemsUpdate: (items: Record<string, number>) => void;
}

const floors = [
  { id: 'basement', label: 'Basement' },
  { id: 'ground', label: 'Ground' },
  { id: 'first', label: 'First' },
  { id: 'second', label: 'Second' },
];

export const Moving3DStep: React.FC<Moving3DStepProps> = ({ rooms, items, onRoomsUpdate, onItemsUpdate }) => {
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const totalItems = useMemo(() => Object.values(items).reduce((a, b) => a + b, 0), [items]);

  const handleRoomCountChange = (roomId: string, floorId: string, nextCount: number) => {
    const updated = [...rooms];
    const idx = updated.findIndex(r => r.room === roomId && r.floor === floorId);
    if (idx >= 0) {
      if (nextCount <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...updated[idx], count: nextCount };
      }
    } else if (nextCount > 0) {
      updated.push({ room: roomId, floor: floorId, count: nextCount });
    }
    onRoomsUpdate(updated);
  };

  const resetSelection = () => {
    setSelectedRoom(null);
    setSelectedFloor(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="h-[600px] lg:h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers3 className="h-5 w-5" /> Visual Home Explorer
          </CardTitle>
          {selectedFloor && (
            <Button variant="outline" size="sm" onClick={resetSelection}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[480px] lg:h-[520px] rounded-md overflow-hidden">
            <Canvas camera={{ position: [8, 6, 10], fov: 45 }}>
              <color attach="background" args={['hsl(210, 20%, 98%)']} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 12, 8]} intensity={0.9} />
              <Environment preset="city" />
              <Grid
                position={[0, -0.6, 0]}
                args={[40, 40]}
                cellSize={1}
                cellColor="hsl(215, 16%, 82%)"
                sectionSize={5}
                sectionColor="hsl(215, 28%, 55%)"
                fadeDistance={30}
                infiniteGrid
              />
              <Building floors={floors} selectedFloor={selectedFloor} onSelectFloor={(f) => { setSelectedFloor(f); setSelectedRoom(null); }} />
              <ContactShadows position={[0, -0.6, 0]} opacity={0.35} scale={30} blur={1.8} />
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select a Floor, then a Room, then Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {floors.map(f => (
                <Badge
                  key={f.id}
                  variant={selectedFloor === f.id ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => { setSelectedFloor(f.id); setSelectedRoom(null); }}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
            <Separator className="my-3" />
            <ScrollArea className="h-[360px] pr-3">
              {!selectedFloor && (
                <p className="text-muted-foreground">Pick a floor in the 3D view or from the badges above.</p>
              )}
              {!!selectedFloor && !selectedRoom && (
                <FloorRoomsOverlay
                  floorId={selectedFloor}
                  onSelectRoom={(roomId) => setSelectedRoom(roomId)}
                />
              )}
              {!!selectedFloor && !!selectedRoom && (
                <RoomItemsPanel
                  floorId={selectedFloor}
                  roomId={selectedRoom}
                  items={items}
                  onItemsUpdate={onItemsUpdate}
                  currentRoomCount={rooms.find(r => r.room === selectedRoom && r.floor === selectedFloor)?.count || 0}
                  onRoomCountChange={(count) => handleRoomCountChange(selectedRoom, selectedFloor, count)}
                  onBack={() => setSelectedRoom(null)}
                />
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              <span>{totalItems} item{totalItems !== 1 ? 's' : ''} selected</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Rooms selected: {rooms.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Moving3DStep;
