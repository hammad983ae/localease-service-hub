import React, { useState } from 'react';
import { Edges, Text } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface FloorInteriorProps {
  floorId: string;
  y: number; // world Y position where the floor interior should be rendered
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

// Very lightweight floor interior with 4 rooms and a few low‑poly furniture props.
// Purely visual: does NOT alter booking data; it only improves understanding of the space.
const w = 6; // same width/depth used by Building
const d = 6;
const margin = 0.6; // interior padding within the shell
const roomH = 0.12; // thickness for room floor tiles

const ROOM_LAYOUT = [
  { id: 'livingRoom', label: 'Living', x: 1.2, z: 1.2, sx: (w - 2 * margin) * 0.55, sz: (d - 2 * margin) * 0.55 }, // front-right
  { id: 'kitchen', label: 'Kitchen', x: -1.2, z: 1.2, sx: (w - 2 * margin) * 0.35, sz: (d - 2 * margin) * 0.45 }, // front-left
  { id: 'bedroom', label: 'Bedroom', x: -1.2, z: -1.2, sx: (w - 2 * margin) * 0.45, sz: (d - 2 * margin) * 0.45 }, // back-left
  { id: 'bathroom', label: 'Bath', x: 1.2, z: -1.2, sx: (w - 2 * margin) * 0.35, sz: (d - 2 * margin) * 0.35 }, // back-right
];

export const FloorInterior: React.FC<FloorInteriorProps> = ({ floorId, y, selectedRoom, onSelectRoom }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // Perimeter low walls
  const wallT = 0.08; // thickness
  const wallH = 0.4;  // height of interior walls
  const innerW = w - margin * 2;
  const innerD = d - margin * 2;

  return (
    <group position={[0, y + 0.1, 0]}>
      {/* Perimeter walls */}
      {/* Front/back walls */}
      <mesh position={[0, wallH / 2, (innerD / 2) + (wallT / 2) + margin]}>
        <boxGeometry args={[innerW, wallH, wallT]} />
        <meshStandardMaterial color="hsl(210, 18%, 78%)" roughness={0.7} />
      </mesh>
      <mesh position={[0, wallH / 2, -(innerD / 2) - (wallT / 2) - margin]}>
        <boxGeometry args={[innerW, wallH, wallT]} />
        <meshStandardMaterial color="hsl(210, 18%, 78%)" roughness={0.7} />
      </mesh>
      {/* Left/right walls */}
      <mesh position={[ (innerW / 2) + (wallT / 2) + margin, wallH / 2, 0]}>
        <boxGeometry args={[wallT, wallH, innerD]} />
        <meshStandardMaterial color="hsl(210, 18%, 78%)" roughness={0.7} />
      </mesh>
      <mesh position={[ -(innerW / 2) - (wallT / 2) - margin, wallH / 2, 0]}>
        <boxGeometry args={[wallT, wallH, innerD]} />
        <meshStandardMaterial color="hsl(210, 18%, 78%)" roughness={0.7} />
      </mesh>

      {/* Rooms */}
      {ROOM_LAYOUT.map((r) => {
        const isSel = selectedRoom === r.id;
        const isHover = hovered === r.id;
        const color = isSel ? 'hsl(159, 65%, 50%)' : isHover ? 'hsl(159, 65%, 70%)' : 'hsl(210, 22%, 92%)';
        return (
          <group key={r.id}>
            <mesh
              position={[r.x, 0, r.z]}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(r.id); document.body.style.cursor = 'pointer'; }}
              onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(null); document.body.style.cursor = 'auto'; }}
              onPointerDown={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelectRoom(r.id); }}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[r.sx, roomH, r.sz]} />
              <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
              <Edges threshold={15} color="hsl(215, 10%, 65%)" />
            </mesh>
            <Text position={[r.x, 0.12, r.z]} fontSize={0.18} color="hsl(215, 25%, 35%)" anchorX="center" anchorY="middle">{r.label}</Text>

            {/* Simple low‑poly props per room (purely illustrative) */}
            {r.id === 'livingRoom' && (
              <group position={[r.x + r.sx * 0.15, 0.08, r.z + r.sz * 0.1]}>
                {/* couch */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[0.9, 0.12, 0.4]} />
                  <meshStandardMaterial color="hsl(210, 16%, 70%)" />
                </mesh>
                <mesh position={[0, 0.12, -0.2]}>
                  <boxGeometry args={[0.9, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(210, 10%, 50%)" />
                </mesh>
              </group>
            )}
            {r.id === 'bedroom' && (
              <group position={[r.x - r.sx * 0.1, 0.08, r.z - r.sz * 0.1]}>
                {/* bed */}
                <mesh>
                  <boxGeometry args={[0.9, 0.12, 0.6]} />
                  <meshStandardMaterial color="hsl(210, 16%, 75%)" />
                </mesh>
                <mesh position={[0, 0.12, 0.25]}>
                  <boxGeometry args={[0.9, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(210, 10%, 55%)" />
                </mesh>
              </group>
            )}
            {r.id === 'kitchen' && (
              <group position={[r.x, 0.08, r.z]}>
                {/* table */}
                <mesh>
                  <boxGeometry args={[0.6, 0.05, 0.6]} />
                  <meshStandardMaterial color="hsl(40, 45%, 65%)" />
                </mesh>
                <mesh position={[0.25, -0.04, 0.25]}>
                  <boxGeometry args={[0.05, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(25, 30%, 40%)" />
                </mesh>
                <mesh position={[-0.25, -0.04, 0.25]}>
                  <boxGeometry args={[0.05, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(25, 30%, 40%)" />
                </mesh>
                <mesh position={[0.25, -0.04, -0.25]}>
                  <boxGeometry args={[0.05, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(25, 30%, 40%)" />
                </mesh>
                <mesh position={[-0.25, -0.04, -0.25]}>
                  <boxGeometry args={[0.05, 0.08, 0.05]} />
                  <meshStandardMaterial color="hsl(25, 30%, 40%)" />
                </mesh>
              </group>
            )}
            {r.id === 'bathroom' && (
              <group position={[r.x + r.sx * 0.1, 0.08, r.z]}>
                {/* sink (cylinder) */}
                <mesh>
                  <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
                  <meshStandardMaterial color="hsl(200, 10%, 85%)" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default FloorInterior;
