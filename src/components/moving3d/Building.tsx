import React from 'react';
import { ThreeEvent } from '@react-three/fiber';

interface BuildingProps {
  floors: { id: string; label: string }[];
  selectedFloor: string | null;
  onSelectFloor: (id: string) => void;
}

// Simple stacked floors as clickable boxes
export const Building: React.FC<BuildingProps> = ({ floors, selectedFloor, onSelectFloor }) => {
  return (
    <group>
      {floors.map((f, idx) => {
        const y = idx * 1.4; // vertical spacing
        const isSelected = selectedFloor === f.id;
        const color = isSelected ? 'hsl(221, 83%, 53%)' : 'hsl(210, 14%, 70%)';
        return (
          <mesh
            key={f.id}
            position={[0, y, 0]}
            onPointerDown={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelectFloor(f.id);
            }}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[6, 1, 6]} />
            <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} emissive={isSelected ? 'hsl(221, 83%, 60%)' : 'hsl(0, 0%, 0%)'} emissiveIntensity={isSelected ? 0.2 : 0} />
          </mesh>
        );
      })}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="hsl(210, 20%, 90%)" />
      </mesh>
    </group>
  );
};
