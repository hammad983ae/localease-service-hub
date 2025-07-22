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
  'living-room': {
    base: '#8B7355',
    top: '#A0845C',
    side: '#6B5A45',
    accent: '#D4C4A8'
  },
  'bedroom': {
    base: '#6B73A1',
    top: '#7B83B1',
    side: '#5B6391',
    accent: '#B8BDD4'
  },
  'kitchen': {
    base: '#D97757',
    top: '#E98767',
    side: '#C96747',
    accent: '#F4D1C4'
  },
  'bathroom': {
    base: '#4A9B9B',
    top: '#5AABAB',
    side: '#3A8B8B',
    accent: '#B8D4D4'
  },
  'dining-room': {
    base: '#6B8B47',
    top: '#7B9B57',
    side: '#5B7B37',
    accent: '#C4D4A8'
  },
  'office': {
    base: '#8B6B47',
    top: '#9B7B57',
    side: '#7B5B37',
    accent: '#D4C4A8'
  },
  'storage': {
    base: '#7B7B7B',
    top: '#8B8B8B',
    side: '#6B6B6B',
    accent: '#C4C4C4'
  }
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
  { id: 'living-1', type: 'living-room', x: 60, y: 60, width: 140, height: 90, floor: 0, name: 'Living Room' },
  { id: 'kitchen-1', type: 'kitchen', x: 220, y: 60, width: 110, height: 70, floor: 0, name: 'Kitchen' },
  { id: 'dining-1', type: 'dining-room', x: 220, y: 150, width: 90, height: 70, floor: 0, name: 'Dining Room' },
  { id: 'bathroom-1', type: 'bathroom', x: 60, y: 170, width: 50, height: 50, floor: 0, name: 'Guest Bathroom' },
  
  // First Floor
  { id: 'bedroom-1', type: 'bedroom', x: 60, y: 60, width: 110, height: 90, floor: 1, name: 'Master Bedroom' },
  { id: 'bedroom-2', type: 'bedroom', x: 190, y: 60, width: 90, height: 70, floor: 1, name: 'Bedroom 2' },
  { id: 'bathroom-2', type: 'bathroom', x: 190, y: 150, width: 70, height: 70, floor: 1, name: 'Main Bathroom' },
  { id: 'office-1', type: 'office', x: 300, y: 60, width: 70, height: 90, floor: 1, name: 'Office' },
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
  const floorOffset = 35;

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
    const colors = ROOM_COLORS[room.type];
    
    return (
      <g key={room.id}>
        {/* Room shadow for depth */}
        <rect
          x={room.x + 3}
          y={room.y + yOffset + 3}
          width={room.width}
          height={room.height}
          fill="rgba(0,0,0,0.2)"
          rx={6}
          className="pointer-events-none"
        />
        
        {/* Room base with texture */}
        <rect
          x={room.x}
          y={room.y + yOffset}
          width={room.width}
          height={room.height}
          fill={colors.base}
          stroke={isSelected ? '#F59E0B' : '#444444'}
          strokeWidth={isSelected ? 3 : 1}
          rx={6}
          className="cursor-pointer transition-all duration-300 hover:brightness-110"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room pattern/texture */}
        <rect
          x={room.x + 4}
          y={room.y + yOffset + 4}
          width={room.width - 8}
          height={room.height - 8}
          fill="none"
          stroke={colors.accent}
          strokeWidth={1}
          strokeDasharray="2,2"
          rx={4}
          opacity={0.4}
          className="pointer-events-none"
        />
        
        {/* Room top (isometric effect) with gradient */}
        <defs>
          <linearGradient id={`topGradient-${room.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.top} />
            <stop offset="100%" stopColor={colors.base} />
          </linearGradient>
        </defs>
        <polygon
          points={`${room.x},${room.y + yOffset} ${room.x + 18},${room.y - 12 + yOffset} ${room.x + room.width + 18},${room.y - 12 + yOffset} ${room.x + room.width},${room.y + yOffset}`}
          fill={`url(#topGradient-${room.id})`}
          stroke={isSelected ? '#F59E0B' : '#444444'}
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room side (isometric effect) with gradient */}
        <defs>
          <linearGradient id={`sideGradient-${room.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.side} />
            <stop offset="100%" stopColor={colors.base} />
          </linearGradient>
        </defs>
        <polygon
          points={`${room.x + room.width},${room.y + yOffset} ${room.x + room.width + 18},${room.y - 12 + yOffset} ${room.x + room.width + 18},${room.y + room.height - 12 + yOffset} ${room.x + room.width},${room.y + room.height + yOffset}`}
          fill={`url(#sideGradient-${room.id})`}
          stroke={isSelected ? '#F59E0B' : '#444444'}
          strokeWidth={isSelected ? 2 : 1}
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room icon with background circle */}
        <circle
          cx={room.x + room.width / 2}
          cy={room.y + room.height / 2 - 8 + yOffset}
          r={16}
          fill="rgba(255,255,255,0.9)"
          stroke={colors.base}
          strokeWidth={2}
          className="pointer-events-none"
        />
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2 - 8 + yOffset}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg pointer-events-none"
          style={{ fontSize: '16px' }}
        >
          {ROOM_TYPES.find(t => t.type === room.type)?.icon}
        </text>
        
        {/* Room name with background */}
        <rect
          x={room.x + room.width / 2 - 35}
          y={room.y + room.height / 2 + 8 + yOffset}
          width={70}
          height={16}
          fill="rgba(255,255,255,0.9)"
          rx={8}
          className="pointer-events-none"
        />
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2 + 16 + yOffset}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium pointer-events-none"
          fill="#444444"
          style={{ fontSize: '9px' }}
        >
          {room.name}
        </text>
        
        {/* Selection indicator */}
        {isSelected && (
          <circle
            cx={room.x + room.width - 8}
            cy={room.y + 8 + yOffset}
            r={6}
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth={2}
            className="pointer-events-none"
          />
        )}
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
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden border-2 border-muted">
        <svg
          ref={svgRef}
          width="100%"
          height="380"
          viewBox="0 0 500 380"
          className={isAddingRoom ? "cursor-crosshair" : "cursor-default"}
          onClick={handleSvgClick}
        >
          {/* Background pattern */}
          <defs>
            <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#F8F9FA"/>
              <rect width="1" height="20" fill="#E5E7EB"/>
              <rect width="20" height="1" fill="#E5E7EB"/>
            </pattern>
          </defs>
          
          {/* Floor base with wood texture */}
          <rect
            x="40"
            y={40 + (currentFloor * floorOffset)}
            width="380"
            height="230"
            fill="url(#floorPattern)"
            stroke="#D1D5DB"
            strokeWidth="3"
            rx="12"
          />
          
          {/* Floor top (isometric) */}
          <polygon
            points={`40,${40 + (currentFloor * floorOffset)} 55,${25 + (currentFloor * floorOffset)} 435,${25 + (currentFloor * floorOffset)} 420,${40 + (currentFloor * floorOffset)}`}
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="3"
          />
          
          {/* Floor side (isometric) */}
          <polygon
            points={`420,${40 + (currentFloor * floorOffset)} 435,${25 + (currentFloor * floorOffset)} 435,${255 + (currentFloor * floorOffset)} 420,${270 + (currentFloor * floorOffset)}`}
            fill="#E5E7EB"
            stroke="#D1D5DB"
            strokeWidth="3"
          />

          {/* Rooms */}
          {currentFloorRooms.map(room => renderRoom(room, currentFloor))}
          
          {/* Add room instruction */}
          {isAddingRoom && (
            <g>
              <rect
                x="175"
                y="180"
                width="150"
                height="30"
                fill="rgba(255,255,255,0.95)"
                stroke="#D1D5DB"
                strokeWidth="1"
                rx="6"
              />
              <text
                x="250"
                y="200"
                textAnchor="middle"
                className="text-sm fill-muted-foreground"
                style={{ fontSize: '12px' }}
              >
                Click to add {ROOM_TYPES.find(t => t.type === selectedRoomType)?.name}
              </text>
            </g>
          )}
          
          {/* Floor number indicator */}
          <g>
            <circle
              cx="460"
              cy="350"
              r="20"
              fill="rgba(255,255,255,0.9)"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            <text
              x="460"
              y="355"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-muted-foreground"
            >
              {currentFloor + 1}
            </text>
          </g>
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
