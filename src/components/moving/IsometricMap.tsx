import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Room {
  id: string;
  type: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining-room' | 'office' | 'storage';
  x: number;
  y: number;
  width: number;
  height: number;
  floor: number;
  name: string;
  selected?: boolean;
}

interface IsometricMapProps {
  onRoomSelect?: (room: Room) => void;
  selectedRooms?: Room[];
  mode: 'room-selection' | 'item-placement';
  onRoomAdd?: (room: Room) => void;
}

const ROOM_COLORS = {
  'living-room': '#6366F1',
  'bedroom': '#8B5CF6',
  'kitchen': '#F59E0B',
  'bathroom': '#06B6D4',
  'dining-room': '#10B981',
  'office': '#F97316',
  'storage': '#6B7280'
};

const ROOM_TYPES = [
  { type: 'living-room', name: 'Living Room', icon: '🛋️' },
  { type: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { type: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { type: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { type: 'dining-room', name: 'Dining Room', icon: '🍽️' },
  { type: 'office', name: 'Office', icon: '💼' },
  { type: 'storage', name: 'Storage', icon: '📦' }
] as const;

const INITIAL_ROOMS: Room[] = [
  // Ground Floor
  { id: 'living-1', type: 'living-room', x: 50, y: 50, width: 150, height: 100, floor: 0, name: 'Living Room' },
  { id: 'kitchen-1', type: 'kitchen', x: 220, y: 50, width: 120, height: 80, floor: 0, name: 'Kitchen' },
  { id: 'dining-1', type: 'dining-room', x: 220, y: 150, width: 100, height: 80, floor: 0, name: 'Dining Room' },
  { id: 'bathroom-1', type: 'bathroom', x: 50, y: 170, width: 60, height: 60, floor: 0, name: 'Guest Bathroom' },
  
  // First Floor
  { id: 'bedroom-1', type: 'bedroom', x: 50, y: 50, width: 120, height: 100, floor: 1, name: 'Master Bedroom' },
  { id: 'bedroom-2', type: 'bedroom', x: 190, y: 50, width: 100, height: 80, floor: 1, name: 'Bedroom 2' },
  { id: 'bathroom-2', type: 'bathroom', x: 190, y: 150, width: 80, height: 80, floor: 1, name: 'Main Bathroom' },
  { id: 'office-1', type: 'office', x: 300, y: 50, width: 80, height: 100, floor: 1, name: 'Office' },
];

export const IsometricMap: React.FC<IsometricMapProps> = ({ 
  onRoomSelect, 
  selectedRooms = [], 
  mode, 
  onRoomAdd 
}) => {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<Room['type']>('living-room');
  const svgRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  const maxFloors = 3;
  const floorHeight = 300;
  const floorOffset = 40;

  const handleRoomClick = (room: Room) => {
    if (mode === 'room-selection' && onRoomSelect) {
      onRoomSelect(room);
    }
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingRoom || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top - (currentFloor * floorOffset);

    const newRoom: Room = {
      id: `${selectedRoomType}-${Date.now()}`,
      type: selectedRoomType,
      x: Math.max(10, x - 50),
      y: Math.max(10, y - 40),
      width: 100,
      height: 80,
      floor: currentFloor,
      name: `${ROOM_TYPES.find(t => t.type === selectedRoomType)?.name} ${rooms.filter(r => r.type === selectedRoomType).length + 1}`
    };

    setRooms(prev => [...prev, newRoom]);
    onRoomAdd?.(newRoom);
    setIsAddingRoom(false);
    toast({
      title: "Room Added",
      description: `${newRoom.name} has been added to floor ${currentFloor + 1}`,
    });
  };

  const isRoomSelected = (room: Room) => {
    return selectedRooms.some(selected => selected.id === room.id);
  };

  const renderRoom = (room: Room, floorIndex: number) => {
    const isSelected = isRoomSelected(room);
    const yOffset = floorIndex * floorOffset;
    
    return (
      <g key={room.id}>
        {/* Room base */}
        <rect
          x={room.x}
          y={room.y + yOffset}
          width={room.width}
          height={room.height}
          fill={ROOM_COLORS[room.type]}
          stroke={isSelected ? '#F59E0B' : '#374151'}
          strokeWidth={isSelected ? 3 : 1}
          opacity={isSelected ? 0.9 : 0.7}
          rx={4}
          className="cursor-pointer transition-all duration-200 hover:opacity-90"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room top (isometric effect) */}
        <polygon
          points={`${room.x},${room.y + yOffset} ${room.x + 20},${room.y - 15 + yOffset} ${room.x + room.width + 20},${room.y - 15 + yOffset} ${room.x + room.width},${room.y + yOffset}`}
          fill={ROOM_COLORS[room.type]}
          opacity={isSelected ? 0.95 : 0.8}
          stroke={isSelected ? '#F59E0B' : '#374151'}
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room side (isometric effect) */}
        <polygon
          points={`${room.x + room.width},${room.y + yOffset} ${room.x + room.width + 20},${room.y - 15 + yOffset} ${room.x + room.width + 20},${room.y + room.height - 15 + yOffset} ${room.x + room.width},${room.y + room.height + yOffset}`}
          fill={ROOM_COLORS[room.type]}
          opacity={isSelected ? 0.8 : 0.6}
          stroke={isSelected ? '#F59E0B' : '#374151'}
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room label */}
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2 + yOffset}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-white pointer-events-none"
          style={{ fontSize: '10px' }}
        >
          {ROOM_TYPES.find(t => t.type === room.type)?.icon}
        </text>
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2 + 12 + yOffset}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-white pointer-events-none"
          style={{ fontSize: '8px' }}
        >
          {room.name}
        </text>
      </g>
    );
  };

  const currentFloorRooms = rooms.filter(room => room.floor === currentFloor);

  return (
    <div className="w-full bg-background border rounded-lg p-4 space-y-4">
      {/* Floor Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Floor {currentFloor + 1}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentFloor(Math.max(0, currentFloor - 1))}
            disabled={currentFloor === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="text-xs text-muted-foreground px-2">
            {currentFloor + 1} / {maxFloors}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentFloor(Math.min(maxFloors - 1, currentFloor + 1))}
            disabled={currentFloor === maxFloors - 1}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Room Type Selector (when adding rooms) */}
      {isAddingRoom && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          {ROOM_TYPES.map((roomType) => (
            <Button
              key={roomType.type}
              variant={selectedRoomType === roomType.type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoomType(roomType.type)}
              className="text-xs"
            >
              {roomType.icon} {roomType.name}
            </Button>
          ))}
        </div>
      )}

      {/* Map SVG */}
      <div className="relative bg-muted/30 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="350"
          viewBox="0 0 500 350"
          className={isAddingRoom ? "cursor-crosshair" : "cursor-default"}
          onClick={handleSvgClick}
        >
          {/* Floor base */}
          <rect
            x="30"
            y={30 + (currentFloor * floorOffset)}
            width="400"
            height="250"
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="2"
            rx="8"
          />
          
          {/* Floor top (isometric) */}
          <polygon
            points={`30,${30 + (currentFloor * floorOffset)} 50,${15 + (currentFloor * floorOffset)} 450,${15 + (currentFloor * floorOffset)} 430,${30 + (currentFloor * floorOffset)}`}
            fill="#E5E7EB"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          
          {/* Floor side (isometric) */}
          <polygon
            points={`430,${30 + (currentFloor * floorOffset)} 450,${15 + (currentFloor * floorOffset)} 450,${265 + (currentFloor * floorOffset)} 430,${280 + (currentFloor * floorOffset)}`}
            fill="#D1D5DB"
            stroke="#D1D5DB"
            strokeWidth="2"
          />

          {/* Rooms */}
          {currentFloorRooms.map(room => renderRoom(room, currentFloor))}
          
          {/* Add room instruction */}
          {isAddingRoom && (
            <text
              x="250"
              y="200"
              textAnchor="middle"
              className="text-sm fill-muted-foreground"
            >
              Click anywhere to add a {ROOM_TYPES.find(t => t.type === selectedRoomType)?.name}
            </text>
          )}
        </svg>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {mode === 'room-selection' ? 'Click rooms to select them' : 'View selected rooms and items'}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingRoom(!isAddingRoom)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Room
        </Button>
      </div>

      {/* Selected rooms indicator */}
      {selectedRooms.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Selected: {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};