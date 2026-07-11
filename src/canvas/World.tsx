import React, { useEffect, useRef } from 'react'
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { animate, useMotionValue } from 'framer-motion'
import * as THREE from 'three'

interface WorldProps {
  section: number
}

/* Floating decorative shapes — respond to section changes */
const decorativeElements = [
  { pos: [-6, 2, -8], scale: 2.0, color: '#6C63FF', speed: 2, distort: 0.3, type: 'sphere' as const },
  { pos: [7, 1, -6], scale: 2.5, color: '#FF6B9D', speed: 3, distort: 0.6, type: 'sphere' as const },
  { pos: [-5, -1, -12], scale: 1.8, color: '#4ECDC4', speed: 4, distort: 0.8, type: 'sphere' as const },
  { pos: [5, 3, -14], scale: 1.5, color: '#FFD93D', speed: 2.5, distort: 0.4, type: 'box' as const },
  { pos: [-7, 0.5, -16], scale: 2.2, color: '#FF6B6B', speed: 3.5, distort: 0.5, type: 'sphere' as const },
  { pos: [8, 2.5, -18], scale: 1.6, color: '#6C63FF', speed: 1.8, distort: 0.7, type: 'box' as const },
]

function DecorativeMesh({
  el,
  section,
}: {
  el: typeof decorativeElements[number]
  section: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const scaleVal = useMotionValue(section === 0 ? el.scale : 0)

  useEffect(() => {
    const control = animate(scaleVal, section === 0 ? el.scale : 0, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
    return () => control.stop()
  }, [section, el.scale, scaleVal])

  useFrame(() => {
    if (groupRef.current) {
      const s = scaleVal.get()
      groupRef.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={groupRef} position={el.pos as [number, number, number]} scale={el.scale}>
      <Float speed={el.speed} rotationIntensity={0.4} floatIntensity={0.8}>
        {el.type === 'sphere' ? (
          <mesh>
            <sphereGeometry args={[0.8, 32, 32]} />
            <MeshDistortMaterial
              color={el.color}
              transparent
              opacity={0.35}
              distort={el.distort}
              speed={el.speed}
            />
          </mesh>
        ) : (
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <MeshWobbleMaterial
              color={el.color}
              transparent
              opacity={0.3}
              factor={el.distort}
              speed={el.speed}
            />
          </mesh>
        )}
      </Float>
    </group>
  )
}

export default function World({ section }: WorldProps) {
  const groupRef = useRef<THREE.Group>(null)

  /* gentle ambient rotation */
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <>
      {/* ── Lights ── */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-3, 5, -5]} intensity={0.4} color="#6C63FF" />
      <hemisphereLight args={['#6C63FF', '#1a1a2e', 0.3]} />

      {/* ── Environment decorative shapes ── */}
      <group ref={groupRef}>
        {decorativeElements.map((el, i) => (
          <DecorativeMesh key={i} el={el} section={section} />
        ))}
      </group>
    </>
  )
}
