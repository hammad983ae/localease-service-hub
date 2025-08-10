import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Home, ZoomIn, ZoomOut, RotateCcw, Move, Edit3, Info, X } from 'lucide-react';
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
  items?: Array<{
    id: string;
    name: string;
    icon: string;
    x: number;
    y: number;
  }>;
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
    accent: '#D4C4A8',
    shadow: '#D4C4A8'
  },
  'bedroom': {
    base: '#FFF8DC',
    walls: '#F0E6D2',
    accent: '#E6D7C3',
    shadow: '#E6D7C3'
  },
  'kitchen': {
    base: '#F8F8FF',
    walls: '#E6E6FA',
    accent: '#DDD8E8',
    shadow: '#DDD8E8'
  },
  'bathroom': {
    base: '#E0F6FF',
    walls: '#CCE7FF',
    accent: '#B8D4E8',
    shadow: '#B8D4E8'
  },
  'dining-room': {
    base: '#F0F8E8',
    walls: '#E0F0D0',
    accent: '#D4E8C4',
    shadow: '#D4E8C4'
  },
  'office': {
    base: '#FFF5EE',
    walls: '#F5E6D3',
    accent: '#E8D4C4',
    shadow: '#E8D4C4'
  },
  'storage': {
    base: '#F5F5F5',
    walls: '#E8E8E8',
    accent: '#D8D8D8',
    shadow: '#D8D8D8'
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

// Realistic floor plan layouts with enhanced 3D positioning
const FLOOR_PLANS = [
  // Ground Floor - Open plan living
  {
    walls: [
      // Outer walls
      { x1: 50, y1: 50, x2: 450, y2: 50, thickness: 8, height: 20 },
      { x1: 450, y1: 50, x2: 450, y2: 300, thickness: 8, height: 20 },
      { x1: 450, y1: 300, x2: 50, y2: 300, thickness: 8, height: 20 },
      { x1: 50, y1: 300, x2: 50, y2: 50, thickness: 8, height: 20 },
      
      // Interior walls
      { x1: 320, y1: 50, x2: 320, y2: 180, thickness: 6, height: 15 },
      { x1: 320, y1: 220, x2: 320, y2: 300, thickness: 6, height: 15 },
      { x1: 320, y1: 180, x2: 380, y2: 180, thickness: 6, height: 15 },
      { x1: 380, y1: 180, x2: 380, y2: 220, thickness: 6, height: 15 },
      { x1: 320, y1: 220, x2: 380, y2: 220, thickness: 6, height: 15 },
    ],
    rooms: [
      { id: 'living-1', type: 'living-room', x: 60, y: 60, width: 250, height: 180, floor: 0, name: 'Living Room' },
      { id: 'kitchen-1', type: 'kitchen', x: 330, y: 60, width: 110, height: 110, floor: 0, name: 'Kitchen' },
      { id: 'bathroom-1', type: 'bathroom', x: 330, y: 190, width: 110, height: 100, floor: 0, name: 'Bathroom' },
      { id: 'dining-1', type: 'dining-room', x: 60, y: 250, width: 250, height: 40, floor: 0, name: 'Dining Area' },
    ],
    furniture: [
      // Living room furniture
      { type: 'sofa', x: 80, y: 140, width: 80, height: 25, rotation: 0, depth: 15 },
      { type: 'table', x: 90, y: 110, width: 40, height: 20, rotation: 0, depth: 12 },
      { type: 'tv', x: 280, y: 80, width: 20, height: 8, rotation: 0, depth: 10 },
      { type: 'chair', x: 180, y: 120, width: 20, height: 20, rotation: 45, depth: 18 },
      
      // Kitchen furniture
      { type: 'counter', x: 340, y: 70, width: 90, height: 15, rotation: 0, depth: 8 },
      { type: 'island', x: 350, y: 120, width: 40, height: 25, rotation: 0, depth: 10 },
      { type: 'fridge', x: 420, y: 80, width: 15, height: 10, rotation: 0, depth: 25 },
      
      // Bathroom furniture
      { type: 'toilet', x: 340, y: 200, width: 12, height: 15, rotation: 0, depth: 12 },
      { type: 'sink', x: 360, y: 200, width: 20, height: 10, rotation: 0, depth: 8 },
      { type: 'shower', x: 400, y: 200, width: 25, height: 25, rotation: 0, depth: 20 },
      
      // Dining furniture
      { type: 'dining-table', x: 120, y: 260, width: 60, height: 20, rotation: 0, depth: 15 },
      { type: 'chair', x: 100, y: 265, width: 12, height: 12, rotation: 0, depth: 18 },
      { type: 'chair', x: 200, y: 265, width: 12, height: 12, rotation: 0, depth: 18 },
    ]
  },
  // First Floor - Bedrooms
  {
    walls: [
      // Outer walls
      { x1: 50, y1: 50, x2: 450, y2: 50, thickness: 8, height: 20 },
      { x1: 450, y1: 50, x2: 450, y2: 300, thickness: 8, height: 20 },
      { x1: 450, y1: 300, x2: 50, y2: 300, thickness: 8, height: 20 },
      { x1: 50, y1: 300, x2: 50, y2: 50, thickness: 8, height: 20 },
      
      // Interior walls
      { x1: 250, y1: 50, x2: 250, y2: 300, thickness: 6, height: 15 },
      { x1: 50, y1: 180, x2: 250, y2: 180, thickness: 6, height: 15 },
      { x1: 250, y1: 150, x2: 450, y2: 150, thickness: 6, height: 15 },
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
      { type: 'bed', x: 100, y: 90, width: 60, height: 40, rotation: 0, depth: 20 },
      { type: 'wardrobe', x: 190, y: 70, width: 40, height: 15, rotation: 90, depth: 25 },
      { type: 'nightstand', x: 80, y: 90, width: 15, height: 15, rotation: 0, depth: 12 },
      
      // Bedroom 2
      { type: 'bed', x: 90, y: 220, width: 50, height: 35, rotation: 0, depth: 18 },
      { type: 'desk', x: 180, y: 200, width: 40, height: 20, rotation: 0, depth: 15 },
      
      // Office
      { type: 'desk', x: 360, y: 80, width: 60, height: 25, rotation: 0, depth: 15 },
      { type: 'chair', x: 375, y: 100, width: 15, height: 15, rotation: 0, depth: 18 },
      { type: 'bookshelf', x: 420, y: 70, width: 15, height: 50, rotation: 0, depth: 30 },
      
      // Bedroom 3
      { type: 'bed', x: 290, y: 200, width: 55, height: 40, rotation: 0, depth: 20 },
      { type: 'wardrobe', x: 380, y: 170, width: 50, height: 15, rotation: 0, depth: 25 },
    ]
  },
  // Second Floor - Attic/Storage
  {
    walls: [
      { x1: 80, y1: 80, x2: 420, y2: 80, thickness: 8, height: 20 },
      { x1: 420, y1: 80, x2: 420, y2: 270, thickness: 8, height: 20 },
      { x1: 420, y1: 270, x2: 80, y2: 270, thickness: 8, height: 20 },
      { x1: 80, y1: 270, x2: 80, y2: 80, thickness: 8, height: 20 },
      
      { x1: 250, y1: 80, x2: 250, y2: 270, thickness: 6, height: 15 },
    ],
    rooms: [
      { id: 'storage-1', type: 'storage', x: 90, y: 90, width: 150, height: 170, floor: 2, name: 'Storage Room' },
      { id: 'office-2', type: 'office', x: 260, y: 90, width: 150, height: 170, floor: 2, name: 'Attic Office' },
    ],
    furniture: [
      { type: 'shelf', x: 100, y: 100, width: 80, height: 15, rotation: 0, depth: 20 },
      { type: 'boxes', x: 120, y: 180, width: 40, height: 40, rotation: 0, depth: 15 },
      { type: 'desk', x: 280, y: 120, width: 70, height: 30, rotation: 0, depth: 15 },
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const maxFloors = 3;

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleRoomClick = (room: Room) => {
    if (mode === 'room-selection' && onRoomSelect) {
      onRoomSelect(room);
    }
    setSelectedRoomDetails(room);
  };

  const findAvailablePosition = (floor: number) => {
    const existingRooms = rooms.filter(r => r.floor === floor);
    const { x: xBounds, y: yBounds, roomSize } = MAP_BOUNDS;
    
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
    
    return { x: xBounds.min + 20, y: yBounds.min + 20 };
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingRoom || !svgRef.current) return;

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

  // 3D Wall rendering with depth
  const renderWalls = (walls: any[]) => {
    return walls.map((wall, index) => {
      const isVertical = Math.abs(wall.x2 - wall.x1) < Math.abs(wall.y2 - wall.y1);
      const depth = wall.height || 15;
      
      return (
        <g key={`wall-${index}`}>
          {/* Wall base */}
          <line
            x1={wall.x1}
            y1={wall.y1}
            x2={wall.x2}
            y2={wall.y2}
            stroke="#8B7355"
            strokeWidth={wall.thickness}
            strokeLinecap="round"
          />
          
          {/* Wall top (3D effect) */}
          <line
            x1={wall.x1 + (isVertical ? depth : 0)}
            y1={wall.y1 + (isVertical ? 0 : -depth)}
            x2={wall.x2 + (isVertical ? depth : 0)}
            y2={wall.y2 + (isVertical ? 0 : -depth)}
            stroke="#A0522D"
            strokeWidth={wall.thickness}
            strokeLinecap="round"
          />
          
          {/* Wall side (if vertical) */}
          {isVertical && (
            <line
              x1={wall.x1}
              y1={wall.y1}
              x2={wall.x1 + depth}
              y2={wall.y1 - depth}
              stroke="#8B7355"
              strokeWidth={wall.thickness}
              strokeLinecap="round"
            />
          )}
        </g>
      );
    });
  };

  // Enhanced furniture rendering with 3D effects
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

      const itemHeight = item.depth || 10;
      const baseColor = colors[item.type as keyof typeof colors] || '#CCC';
      const shadowColor = '#666';

      return (
        <g key={`furniture-${index}`} className="furniture-item">
          {/* Shadow */}
          <rect
            x={item.x + 2}
            y={item.y + 2}
            width={item.width}
            height={item.height}
            fill={shadowColor}
            opacity="0.3"
            rx="2"
          />
          
          {/* Base */}
          <rect
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            fill={baseColor}
            stroke="#666"
            strokeWidth="1"
            rx="2"
            transform={item.rotation ? `rotate(${item.rotation} ${item.x + item.width/2} ${item.y + item.height/2})` : ''}
            className="opacity-90 hover:opacity-100 transition-opacity duration-200"
          />
          
          {/* 3D top */}
          <rect
            x={item.x}
            y={item.y - itemHeight}
            width={item.width}
            height={item.height}
            fill={baseColor}
            stroke="#666"
            strokeWidth="1"
            rx="2"
            transform={item.rotation ? `rotate(${item.rotation} ${item.x + item.width/2} ${item.y + item.height/2})` : ''}
            className="opacity-70"
          />
          
          {/* Special furniture details */}
          {item.type === 'bed' && (
            <>
              <rect
                x={item.x + 5}
                y={item.y + 5}
                width={item.width - 10}
                height={item.height - 10}
                fill="#FFF8DC"
                rx="3"
                className="opacity-90"
              />
              <rect
                x={item.x + 5}
                y={item.y + 5 - itemHeight}
                width={item.width - 10}
                height={item.height - 10}
                fill="#FFF8DC"
                rx="3"
                className="opacity-70"
              />
            </>
          )}
          
          {item.type === 'sofa' && (
            <>
              <rect x={item.x + 5} y={item.y + 2} width={item.width - 10} height={5} fill="#654321" rx="2" />
              <rect x={item.x + 5} y={item.y + item.height - 7} width={item.width - 10} height={5} fill="#654321" rx="2" />
              <rect x={item.x + 5} y={item.y + 2 - itemHeight} width={item.width - 10} height={5} fill="#654321" rx="2" />
            </>
          )}
        </g>
      );
    });
  };

  // Enhanced room rendering with 3D effects and animations
  const renderRoom = (room: Room) => {
    const isSelected = isRoomSelected(room);
    const colors = ROOM_COLORS[room.type];
    
    return (
      <g key={room.id} className="room-group">
        {/* Room shadow */}
        <rect
          x={room.x + 3}
          y={room.y + 3}
          width={room.width}
          height={room.height}
          fill={colors.shadow}
          opacity="0.3"
          rx={4}
        />
        
        {/* Room floor with 3D effect */}
        <rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          fill={colors.base}
          stroke={isSelected ? '#F59E0B' : colors.walls}
          strokeWidth={isSelected ? 3 : 1}
          rx={4}
          className="cursor-pointer transition-all duration-300 hover:brightness-110 hover:scale-105 transform"
          onClick={() => handleRoomClick(room)}
        />
        
        {/* Room walls (3D effect) */}
        <rect
          x={room.x}
          y={room.y - 8}
          width={room.width}
          height={8}
          fill={colors.walls}
          stroke={colors.walls}
          strokeWidth="1"
          rx={4}
          className="opacity-80"
        />
        
        {/* Room pattern with animation */}
        <defs>
          <pattern id={`pattern-${room.id}`} patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill={colors.base}/>
            <circle cx="6" cy="6" r="0.8" fill={colors.accent} opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite"/>
            </circle>
          </pattern>
        </defs>
        <rect
          x={room.x + 2}
          y={room.y + 2}
          width={room.width - 4}
          height={room.height - 4}
          fill={`url(#pattern-${room.id})`}
          className="pointer-events-none"
        />
        
        {/* Room label with enhanced styling */}
        <rect
          x={room.x + room.width / 2 - 35}
          y={room.y + room.height / 2 - 10}
          width={70}
          height={20}
          fill="rgba(255,255,255,0.95)"
          stroke={colors.walls}
          strokeWidth={1}
          rx={10}
          className="pointer-events-none shadow-sm"
        />
        
        {/* Room icon and name */}
        <text
          x={room.x + room.width / 2 - 25}
          y={room.y + room.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs pointer-events-none"
          style={{ fontSize: '14px' }}
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
          style={{ fontSize: '9px' }}
        >
          {room.name}
        </text>
        
        {/* Enhanced selection indicator */}
        {isSelected && (
          <g>
            <circle
              cx={room.x + room.width - 12}
              cy={room.y + 12}
              r={10}
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="pointer-events-none"
            >
              <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <text
              x={room.x + room.width - 12}
              y={room.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              className="text-xs font-bold pointer-events-none"
              style={{ fontSize: '10px' }}
            >
              ✓
            </text>
          </g>
        )}
        
        {/* Room items (if any) */}
        {room.items && room.items.map((item, index) => (
          <g key={`item-${index}`} className="room-item">
            <text
              x={room.x + item.x}
              y={room.y + item.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs pointer-events-none"
              style={{ fontSize: '12px' }}
            >
              {item.icon}
            </text>
          </g>
        ))}
      </g>
    );
  };

  const currentFloorPlan = FLOOR_PLANS[currentFloor];
  const currentFloorRooms = rooms.filter(room => room.floor === currentFloor);

  return (
    <div className="w-full bg-background border rounded-lg p-4 space-y-4" ref={containerRef}>
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
        
        {/* Zoom and View Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          
          <span className="text-xs text-muted-foreground px-2">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Room Type Selector - Enhanced */}
      {isAddingRoom && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-blue-800">Select room type, then click on the map:</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingRoom(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((roomType) => (
                <Button
                  key={roomType.type}
                  variant={selectedRoomType === roomType.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRoomType(roomType.type)}
                  className="text-xs h-8 transition-all duration-200"
                >
                  {roomType.icon} {roomType.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced 3D Floor Plan */}
      <div className="relative bg-gradient-to-br from-stone-50 to-stone-100 rounded-lg overflow-hidden border shadow-lg">
        <div 
          className="relative overflow-hidden"
          style={{ height: '400px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 500 400"
            className={isAddingRoom ? "cursor-crosshair" : isDragging ? "cursor-grabbing" : "cursor-grab"}
            onClick={handleSvgClick}
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Enhanced Background with Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="500" height="400" fill="#FAFAF9" />
            <rect width="500" height="400" fill="url(#grid)" />
            
            {/* Floor plan elements */}
            {currentFloorPlan && (
              <>
                {/* Walls with 3D effect */}
                {renderWalls(currentFloorPlan.walls)}
                
                {/* Rooms with enhanced rendering */}
                {currentFloorRooms.map(room => renderRoom(room))}
                
                {/* Furniture with 3D effects */}
                {renderFurniture(currentFloorPlan.furniture)}
              </>
            )}
            
            {/* Enhanced floor indicator */}
            <g>
              <circle
                cx="460"
                cy="350"
                r="20"
                fill="rgba(255,255,255,0.95)"
                stroke="#8B7355"
                strokeWidth="2"
                className="shadow-lg"
              />
              <text
                x="460"
                y="355"
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
        
        {/* Mini-map for navigation */}
        <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-2 border shadow-lg">
          <div className="text-xs font-medium text-gray-600 mb-1">Mini-map</div>
          <svg width="80" height="60" viewBox="0 0 500 400" className="border rounded">
            <rect width="500" height="400" fill="#FAFAF9" />
            {currentFloorPlan && (
              <>
                {renderWalls(currentFloorPlan.walls)}
                {currentFloorRooms.map(room => (
                  <rect
                    key={room.id}
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={ROOM_COLORS[room.type].base}
                    stroke={ROOM_COLORS[room.type].walls}
                    strokeWidth="1"
                    rx="2"
                  />
                ))}
              </>
            )}
            {/* Viewport indicator */}
            <rect
              x={Math.max(0, -pan.x / zoom)}
              y={Math.max(0, -pan.y / zoom)}
              width={500 / zoom}
              height={400 / zoom}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {mode === 'room-selection' ? 'Click rooms to select them' : 'View your selected room layout'}
          {isDragging && <span className="ml-2 text-blue-600">• Dragging</span>}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isAddingRoom ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingRoom(!isAddingRoom)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {isAddingRoom ? 'Cancel' : 'Add Room'}
          </Button>
        </div>
      </div>

      {/* Selected rooms indicator */}
      {selectedRooms.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          Selected: {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Room Details Panel */}
      {selectedRoomDetails && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center space-x-2">
                <span className="text-2xl">{ROOM_TYPES.find(t => t.type === selectedRoomDetails.type)?.icon}</span>
                <span>{selectedRoomDetails.name}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRoomDetails(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">Type:</span> {ROOM_TYPES.find(t => t.type === selectedRoomDetails.type)?.name}
              </div>
              <div>
                <span className="font-medium">Floor:</span> {selectedRoomDetails.floor + 1}
              </div>
              <div>
                <span className="font-medium">Size:</span> {selectedRoomDetails.width} × {selectedRoomDetails.height}
              </div>
              <div>
                <span className="font-medium">Position:</span> ({selectedRoomDetails.x}, {selectedRoomDetails.y})
              </div>
            </div>
            {selectedRoomDetails.items && selectedRoomDetails.items.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="font-medium text-xs mb-2">Items in this room:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedRoomDetails.items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item.icon} {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
