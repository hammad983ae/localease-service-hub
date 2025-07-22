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
    base: '#F5F1E8',
    walls: '#E8E0D0',
    accent: '#D4C4A8'
  },
  'bedroom': {
    base: '#FFF8DC',
    walls: '#F0E6D2',
    accent: '#E6D7C3'
  },
  'kitchen': {
    base: '#F8F8FF',
    walls: '#E6E6FA',
    accent: '#DDD8E8'
  },
  'bathroom': {
    base: '#E0F6FF',
    walls: '#CCE7FF',
    accent: '#B8D4E8'
  },
  'dining-room': {
    base: '#F0F8E8',
    walls: '#E0F0D0',
    accent: '#D4E8C4'
  },
  'office': {
    base: '#FFF5EE',
    walls: '#F5E6D3',
    accent: '#E8D4C4'
  },
  'storage': {
    base: '#F5F5F5',
    walls: '#E8E8E8',
    accent: '#D8D8D8'
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

// Map boundaries for each floor
const MAP_BOUNDS = {
  x: { min: 60, max: 420 },
  y: { min: 60, max: 250 },
  roomSize: { width: 80, height: 60 }
};

// Realistic floor plan layouts
const FLOOR_PLANS = [
  // Ground Floor - Open plan living
  {
    walls: [
      // Outer walls
      { x1: 50, y1: 50, x2: 450, y2: 50, thickness: 8 }, // Top
      { x1: 450, y1: 50, x2: 450, y2: 300, thickness: 8 }, // Right
      { x1: 450, y1: 300, x2: 50, y2: 300, thickness: 8 }, // Bottom
      { x1: 50, y1: 300, x2: 50, y2: 50, thickness: 8 }, // Left
      
      // Interior walls
      { x1: 320, y1: 50, x2: 320, y2: 180, thickness: 6 }, // Kitchen separator
      { x1: 320, y1: 220, x2: 320, y2: 300, thickness: 6 }, // Bathroom wall
      { x1: 320, y1: 180, x2: 380, y2: 180, thickness: 6 }, // Bathroom top
      { x1: 380, y1: 180, x2: 380, y2: 220, thickness: 6 }, // Bathroom side
      { x1: 320, y1: 220, x2: 380, y2: 220, thickness: 6 }, // Bathroom bottom
    ],
    rooms: [
      { id: 'living-1', type: 'living-room', x: 60, y: 60, width: 250, height: 180, floor: 0, name: 'Living Room' },
      { id: 'kitchen-1', type: 'kitchen', x: 330, y: 60, width: 110, height: 110, floor: 0, name: 'Kitchen' },
      { id: 'bathroom-1', type: 'bathroom', x: 330, y: 190, width: 110, height: 100, floor: 0, name: 'Bathroom' },
      { id: 'dining-1', type: 'dining-room', x: 60, y: 250, width: 250, height: 40, floor: 0, name: 'Dining Area' },
    ],
    furniture: [
      // Living room furniture
      { type: 'sofa', x: 80, y: 140, width: 80, height: 25, rotation: 0 },
      { type: 'table', x: 90, y: 110, width: 40, height: 20, rotation: 0 },
      { type: 'tv', x: 280, y: 80, width: 20, height: 8, rotation: 0 },
      { type: 'chair', x: 180, y: 120, width: 20, height: 20, rotation: 45 },
      
      // Kitchen furniture
      { type: 'counter', x: 340, y: 70, width: 90, height: 15, rotation: 0 },
      { type: 'island', x: 350, y: 120, width: 40, height: 25, rotation: 0 },
      { type: 'fridge', x: 420, y: 80, width: 15, height: 10, rotation: 0 },
      
      // Bathroom furniture
      { type: 'toilet', x: 340, y: 200, width: 12, height: 15, rotation: 0 },
      { type: 'sink', x: 360, y: 200, width: 20, height: 10, rotation: 0 },
      { type: 'shower', x: 400, y: 200, width: 25, height: 25, rotation: 0 },
      
      // Dining furniture
      { type: 'dining-table', x: 120, y: 260, width: 60, height: 20, rotation: 0 },
      { type: 'chair', x: 100, y: 265, width: 12, height: 12, rotation: 0 },
      { type: 'chair', x: 200, y: 265, width: 12, height: 12, rotation: 0 },
    ]
  },
  // First Floor - Bedrooms
  {
    walls: [
      // Outer walls
      { x1: 50, y1: 50, x2: 450, y2: 50, thickness: 8 },
      { x1: 450, y1: 50, x2: 450, y2: 300, thickness: 8 },
      { x1: 450, y1: 300, x2: 50, y2: 300, thickness: 8 },
      { x1: 50, y1: 300, x2: 50, y2: 50, thickness: 8 },
      
      // Interior walls
      { x1: 250, y1: 50, x2: 250, y2: 300, thickness: 6 }, // Central corridor
      { x1: 50, y1: 180, x2: 250, y2: 180, thickness: 6 }, // Master bedroom separator
      { x1: 250, y1: 150, x2: 450, y2: 150, thickness: 6 }, // Second floor rooms
    ],
    rooms: [
      { id: 'bedroom-1', type: 'bedroom', x: 60, y: 60, width: 180, height: 110, floor: 1, name: 'Master Bedroom' },
      { id: 'bedroom-2', type: 'bedroom', x: 60, y: 190, width: 180, height: 100, floor: 1, name: 'Bedroom 2' },
      { id: 'bathroom-2', type: 'bathroom', x: 260, y: 60, width: 80, height: 80, floor: 1, name: 'Master Bath' },
      { id: 'office-1', type: 'office', x: 350, y: 60, width: 90, height: 80, floor: 1, name: 'Office' },
      { id: 'bedroom-3', type: 'bedroom', x: 260, y: 160, width: 180, height: 130, floor: 1, name: 'Bedroom 3' },
    ],
    furniture: [
      // Master bedroom
      { type: 'bed', x: 100, y: 90, width: 60, height: 40, rotation: 0 },
      { type: 'wardrobe', x: 190, y: 70, width: 40, height: 15, rotation: 90 },
      { type: 'nightstand', x: 80, y: 90, width: 15, height: 15, rotation: 0 },
      
      // Bedroom 2
      { type: 'bed', x: 90, y: 220, width: 50, height: 35, rotation: 0 },
      { type: 'desk', x: 180, y: 200, width: 40, height: 20, rotation: 0 },
      
      // Office
      { type: 'desk', x: 360, y: 80, width: 60, height: 25, rotation: 0 },
      { type: 'chair', x: 375, y: 100, width: 15, height: 15, rotation: 0 },
      { type: 'bookshelf', x: 420, y: 70, width: 15, height: 50, rotation: 0 },
      
      // Bedroom 3
      { type: 'bed', x: 290, y: 200, width: 55, height: 40, rotation: 0 },
      { type: 'wardrobe', x: 380, y: 170, width: 50, height: 15, rotation: 0 },
    ]
  },
  // Second Floor - Attic/Storage
  {
    walls: [
      { x1: 80, y1: 80, x2: 420, y2: 80, thickness: 8 },
      { x1: 420, y1: 80, x2: 420, y2: 270, thickness: 8 },
      { x1: 420, y1: 270, x2: 80, y2: 270, thickness: 8 },
      { x1: 80, y1: 270, x2: 80, y2: 80, thickness: 8 },
      
      { x1: 250, y1: 80, x2: 250, y2: 270, thickness: 6 },
    ],
    rooms: [
      { id: 'storage-1', type: 'storage', x: 90, y: 90, width: 150, height: 170, floor: 2, name: 'Storage Room' },
      { id: 'office-2', type: 'office', x: 260, y: 90, width: 150, height: 170, floor: 2, name: 'Attic Office' },
    ],
    furniture: [
      { type: 'shelf', x: 100, y: 100, width: 80, height: 15, rotation: 0 },
      { type: 'boxes', x: 120, y: 180, width: 40, height: 40, rotation: 0 },
      { type: 'desk', x: 280, y: 120, width: 70, height: 30, rotation: 0 },
    ]
  }
];

export const IsometricMap: React.FC<IsometricMapProps> = ({ 
  onRoomSelect, 
  selectedRooms = [], 
  mode, 
  onRoomAdd 
}) => {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [rooms, setRooms] = useState<Room[]>(
    FLOOR_PLANS.flatMap(floor => floor.rooms as Room[])
  );
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<Room['type']>('living-room');
  const svgRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  const maxFloors = 3;

  const handleRoomClick = (room: Room) => {
    if (mode === 'room-selection' && onRoomSelect) {
      onRoomSelect(room);
    }
  };

  const findAvailablePosition = (floor: number) => {
    const existingRooms = rooms.filter(r => r.floor === floor);
    const { x: xBounds, y: yBounds, roomSize } = MAP_BOUNDS;
    
    // Try to find a position that doesn't overlap with existing rooms
    for (let y = yBounds.min; y <= yBounds.max - roomSize.height; y += 20) {
      for (let x = xBounds.min; x <= xBounds.max - roomSize.width; x += 20) {
        const wouldOverlap = existingRooms.some(room => 
          x < room.x + room.width &&
          x + roomSize.width > room.x &&
          y < room.y + room.height &&
          y + roomSize.height > room.y
        );
        
        if (!wouldOverlap) {
          return { x, y };
        }
      }
    }
    
    // If no non-overlapping position found, return a default position
    return { x: xBounds.min + 20, y: yBounds.min + 20 };
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingRoom || !svgRef.current) return;

    // Find the best available position
    const position = findAvailablePosition(currentFloor);
    
    const newRoom: Room = {
      id: `${selectedRoomType}-${Date.now()}`,
      type: selectedRoomType,
      x: position.x,
      y: position.y,
      width: MAP_BOUNDS.roomSize.width,
      height: MAP_BOUNDS.roomSize.height,
      floor: currentFloor,
      name: `${ROOM_TYPES.find(t => t.type === selectedRoomType)?.name} ${rooms.filter(r => r.type === selectedRoomType && r.floor === currentFloor).length + 1}`
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

  const renderWalls = (walls: any[]) => {
    return walls.map((wall, index) => (
      <line
        key={`wall-${index}`}
        x1={wall.x1}
        y1={wall.y1}
        x2={wall.x2}
        y2={wall.y2}
        stroke="#8B7355"
        strokeWidth={wall.thickness}
        strokeLinecap="round"
      />
    ));
  };

  const renderFurniture = (furniture: any[]) => {
    return furniture.map((item, index) => {
      const colors = {
        sofa: '#8B4513',
        table: '#D2691E',
        tv: '#2F2F2F',
        chair: '#CD853F',
        counter: '#F5DEB3',
        island: '#DEB887',
        fridge: '#E6E6FA',
        toilet: '#FFFFFF',
        sink: '#F0F8FF',
        shower: '#E0F6FF',
        'dining-table': '#8B4513',
        bed: '#4682B4',
        wardrobe: '#8B7355',
        nightstand: '#D2691E',
        desk: '#CD853F',
        bookshelf: '#8B4513',
        shelf: '#D2691E',
        boxes: '#DDD'
      };

      return (
        <g key={`furniture-${index}`}>
          <rect
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            fill={colors[item.type as keyof typeof colors] || '#CCC'}
            stroke="#666"
            strokeWidth="1"
            rx="2"
            transform={item.rotation ? `rotate(${item.rotation} ${item.x + item.width/2} ${item.y + item.height/2})` : ''}
            className="opacity-70"
          />
          {item.type === 'bed' && (
            <rect
              x={item.x + 5}
              y={item.y + 5}
              width={item.width - 10}
              height={item.height - 10}
              fill="#FFF8DC"
              rx="3"
              className="opacity-80"
            />
          )}
          {item.type === 'sofa' && (
            <>
              <rect x={item.x + 5} y={item.y + 2} width={item.width - 10} height={5} fill="#654321" rx="2" />
              <rect x={item.x + 5} y={item.y + item.height - 7} width={item.width - 10} height={5} fill="#654321" rx="2" />
            </>
          )}
        </g>
      );
    });
  };

  const renderRoom = (room: Room) => {
    const isSelected = isRoomSelected(room);
    const colors = ROOM_COLORS[room.type];
    
    return (
      <g key={room.id}>
        {/* Room floor */}
        <rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          fill={colors.base}
          stroke={isSelected ? '#F59E0B' : colors.walls}
          strokeWidth={isSelected ? 3 : 1}
          rx={2}
          className="cursor-pointer transition-all duration-300 hover:brightness-110"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room pattern */}
        <defs>
          <pattern id={`pattern-${room.id}`} patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill={colors.base}/>
            <circle cx="5" cy="5" r="0.5" fill={colors.accent} opacity="0.3"/>
          </pattern>
        </defs>
        <rect
          x={room.x + 2}
          y={room.y + 2}
          width={room.width - 4}
          height={room.height - 4}
          fill={`url(#pattern-${room.id})`}
          className="pointer-events-none opacity-60"
        />
        
        {/* Room label background */}
        <rect
          x={room.x + room.width / 2 - 30}
          y={room.y + room.height / 2 - 8}
          width={60}
          height={16}
          fill="rgba(255,255,255,0.95)"
          stroke={colors.walls}
          strokeWidth={1}
          rx={8}
          className="pointer-events-none"
        />
        
        {/* Room icon and name */}
        <text
          x={room.x + room.width / 2 - 20}
          y={room.y + room.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs pointer-events-none"
          style={{ fontSize: '12px' }}
        >
          {ROOM_TYPES.find(t => t.type === room.type)?.icon}
        </text>
        <text
          x={room.x + room.width / 2 + 8}
          y={room.y + room.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium pointer-events-none"
          fill="#444444"
          style={{ fontSize: '8px' }}
        >
          {room.name}
        </text>
        
        {/* Selection indicator */}
        {isSelected && (
          <circle
            cx={room.x + room.width - 10}
            cy={room.y + 10}
            r={8}
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth={2}
            className="pointer-events-none"
          />
        )}
      </g>
    );
  };

  const currentFloorPlan = FLOOR_PLANS[currentFloor];
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

      {/* Room Type Selector - Only show when adding */}
      {isAddingRoom && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
          <div className="w-full text-xs text-muted-foreground mb-2">Select room type, then click on the map:</div>
          {ROOM_TYPES.map((roomType) => (
            <Button
              key={roomType.type}
              variant={selectedRoomType === roomType.type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoomType(roomType.type)}
              className="text-xs h-8"
            >
              {roomType.icon} {roomType.name}
            </Button>
          ))}
        </div>
      )}

      {/* Architectural Floor Plan */}
      <div className="relative bg-gradient-to-br from-stone-50 to-stone-100 rounded-lg overflow-hidden border">
        <svg
          ref={svgRef}
          width="100%"
          height="350"
          viewBox="0 0 500 350"
          className={isAddingRoom ? "cursor-crosshair" : "cursor-default"}
          onClick={handleSvgClick}
        >
          {/* Background */}
          <rect width="500" height="350" fill="#FAFAF9" />
          
          {/* Floor plan elements */}
          {currentFloorPlan && (
            <>
              {/* Walls */}
              {renderWalls(currentFloorPlan.walls)}
              
              {/* Rooms - Show both original and newly added rooms */}
              {currentFloorRooms.map(room => renderRoom(room))}
              
              {/* Furniture */}
              {renderFurniture(currentFloorPlan.furniture)}
            </>
          )}
          
          {/* Floor indicator */}
          <g>
            <circle
              cx="460"
              cy="320"
              r="18"
              fill="rgba(255,255,255,0.9)"
              stroke="#8B7355"
              strokeWidth="2"
            />
            <text
              x="460"
              y="325"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold"
              fill="#8B7355"
            >
              {currentFloor + 1}
            </text>
          </g>
        </svg>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {mode === 'room-selection' ? 'Click rooms to select them' : 'View your selected room layout'}
        </div>
        
        <Button
          variant={isAddingRoom ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAddingRoom(!isAddingRoom)}
        >
          <Plus className="h-3 w-3 mr-1" />
          {isAddingRoom ? 'Cancel' : 'Add Room'}
        </Button>
      </div>

      {/* Selected rooms indicator */}
      {selectedRooms.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          Selected: {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
