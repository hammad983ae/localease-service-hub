import React, { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Edges, Text } from '@react-three/drei';

interface BuildingProps {
  floors: { id: string; label: string }[];
  selectedFloor: string | null;
  onSelectFloor: (id: string) => void;
}

// A simple house silhouette with a pitched roof and semi-transparent walls.
// Each internal floor slab is clickable and highlights when selected.
export const Building: React.FC<BuildingProps> = ({ floors, selectedFloor, onSelectFloor }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const w = 6; // house width
  const d = 6; // house depth
  const slabT = 0.28; // floor slab thickness
  const levelGap = 1.2; // vertical spacing between slabs
  const shellPadding = 0.3; // how much bigger the shell is than floor slabs

  const shellH = (floors.length - 1) * levelGap + slabT + 1.2; // overall shell height
  const roofH = 1.1; // roof height

  const baseY = 0; // ground reference

  // Helpers to compute Y for a given floor index
  const floorY = (idx: number) => baseY + idx * levelGap;

  return (
    <group>
      {/* Semi-transparent shell to read as a home volume */}
      <mesh position={[0, shellH / 2 - 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + shellPadding, shellH, d + shellPadding]} />
        <meshStandardMaterial
          color="hsl(210, 20%, 96%)"
          transparent
          opacity={0.25}
          metalness={0.05}
          roughness={0.7}
        />
        <Edges threshold={15} color="hsl(215, 20%, 60%)" />
      </mesh>

      {/* Clickable floor slabs */}
      {floors.map((f, idx) => {
        const y = floorY(idx);
        const isSelected = selectedFloor === f.id;
        const isHovered = hovered === f.id;
        const color = isSelected
          ? 'hsl(221, 83%, 58%)'
          : isHovered
          ? 'hsl(221, 83%, 70%)'
          : 'hsl(215, 16%, 72%)';

        return (
          <mesh
            key={f.id}
            position={[0, y, 0]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered(f.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered(null);
              document.body.style.cursor = 'auto';
            }}
            onPointerDown={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelectFloor(f.id);
            }}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w - 0.6, slabT, d - 0.6]} />
            <meshStandardMaterial
              color={color}
              metalness={0.1}
              roughness={0.55}
              emissive={isSelected ? 'hsl(221, 83%, 60%)' : 'hsl(0, 0%, 0%)'}
              emissiveIntensity={isSelected ? 0.2 : 0}
            />
            <Edges threshold={15} color="hsl(215, 14%, 52%)" />
          </mesh>
        );
      })}

      {/* Simple door (front) */}
      <mesh position={[0, 0.4, (d + shellPadding) / 2 + 0.001]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 0.8, 0.05]} />
        <meshStandardMaterial color="hsl(30, 40%, 60%)" metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Simple windows */}
      {[ -1.6, 1.6 ].map((x, i) => (
        <mesh key={i} position={[x, 1.6, (d + shellPadding) / 2 + 0.001]}>
          <boxGeometry args={[0.9, 0.5, 0.04]} />
          <meshStandardMaterial color="hsl(210, 30%, 75%)" metalness={0.2} roughness={0.2} />
        </mesh>
      ))}

      {/* Pitched roof as a 4-sided cone (square base) */}
      <mesh position={[0, shellH + roofH / 2 - 0.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(w, d) * 0.65, roofH, 4]} />
        <meshStandardMaterial color="hsl(10, 50%, 45%)" metalness={0.1} roughness={0.7} />
        <Edges color="hsl(10, 45%, 35%)" />
      </mesh>

      {/* Eaves (slight overhang under the roof) */}
      <mesh position={[0, shellH + 0.2, 0]} castShadow>
        <boxGeometry args={[w + 0.2, 0.1, d + 0.2]} />
        <meshStandardMaterial color="hsl(10, 45%, 35%)" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Corner posts to read as structure */}
      {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w/2 + 0.02), shellH/2 - 0.2, sz * (d/2 + 0.02)]} castShadow>
          <boxGeometry args={[0.12, shellH, 0.12]} />
          <meshStandardMaterial color="hsl(210, 15%, 50%)" metalness={0.1} roughness={0.6} />
        </mesh>
      ))}

      {/* Optional floor labels */}
      {floors.map((f, idx) => (
        <Text key={f.id} position={[-(w/2) + 0.2, floorY(idx) + 0.05, (d/2) + 0.25]} fontSize={0.22} color="hsl(215, 25%, 35%)">
          {f.label}
        </Text>
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="hsl(210, 20%, 90%)" />
      </mesh>
    </group>
  );
};
