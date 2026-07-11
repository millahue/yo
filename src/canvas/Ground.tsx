import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { useClickToMove } from '../components/ux/useClickToMove'

const GROUND_SIZE = 30

interface GroundProps {
  onMove?: (x: number, z: number) => void
}

export default function Ground({ onMove }: GroundProps) {
  const { onPointerDown } = useClickToMove({
    enabled: true,
    onMove: (x, z) => onMove?.(x, z),
  })

  return (
    <RigidBody type="fixed" colliders="trimesh" name="ground">
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerDown={onPointerDown}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* subtle grid helper */}
      <gridHelper
        args={[GROUND_SIZE, GROUND_SIZE, '#2a2a4e', '#1f1f3a']}
        position={[0, 0.01, 0]}
      />
    </RigidBody>
  )
}
