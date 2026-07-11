import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations, useCursor } from '@react-three/drei'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

import type { AnimationName } from '../App'
import { animations } from '../config'

/* ── Props ── */
interface CharacterProps {
  animation: AnimationName
  onReady: (handle: CharacterHandle) => void
  onAnimationChange: (name: AnimationName) => void
  touchTarget: { x: number; z: number } | null
}

export interface CharacterHandle {
  setAnimation: (name: AnimationName) => void
  moveTo: (x: number, z: number) => void
}

const SPEED = 3.5
const TARGET_THRESHOLD = 0.4

/* ── Helper: extract SkinnedMesh elements from cloned scene ── */
function extractSkinnedMesh(
  scene: THREE.Object3D,
  texture: THREE.Texture,
): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  scene.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      const mesh = child as THREE.SkinnedMesh
      elements.push(
        <skinnedMesh
          key={mesh.name || mesh.uuid}
          castShadow
          receiveShadow
          geometry={mesh.geometry}
          skeleton={mesh.skeleton}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[100, 100, 100]}
        >
          <meshStandardMaterial
            map={texture}
            map-flipY={false}
            {...({ skinning: true } as any)}
          />
        </skinnedMesh>,
      )
    }
  })
  return elements
}

/* ── Helper: extract first AnimationClip from loaded FBX Group ── */
function clipFromFBX(
  group: THREE.Group,
  name: string,
): THREE.AnimationClip | undefined {
  const clips = (group as any).animations as THREE.AnimationClip[] | undefined
  if (clips?.[0]) {
    clips[0].name = name
    return clips[0]
  }
  return undefined
}

/* ── Component ── */
export default function Character({
  animation,
  onReady,
  onAnimationChange,
  touchTarget,
}: CharacterProps) {
  /* ── Load model ── */
  const { scene } = useGLTF('/models/character.glb')
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return loader.load('/models/character.jpg')
  }, [])

  /* clone skinned mesh so we can re-use */
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene])

  /* ── Load FBX animations ── */
  const animFileMap = useMemo(() => {
    const map: Record<string, string> = {}
    animations.forEach((a) => { map[a.name] = a.file })
    return map
  }, [])

  const idleGroup    = useFBX(animFileMap['Idle'])
  const walkingGroup = useFBX(animFileMap['Walking'])
  const runningGroup = useFBX(animFileMap['Running'])
  const dancingGroup = useFBX(animFileMap['Dancing'])
  const jumpingGroup = useFBX(animFileMap['Jumping'])

  /* name them so useAnimations can find them */
  const namedAnimations = useMemo(() => {
    return [
      clipFromFBX(idleGroup,    'Idle'),
      clipFromFBX(walkingGroup, 'Walking'),
      clipFromFBX(runningGroup, 'Running'),
      clipFromFBX(dancingGroup, 'Dancing'),
      clipFromFBX(jumpingGroup, 'Jumping'),
    ].filter(Boolean) as THREE.AnimationClip[]
  }, [idleGroup, walkingGroup, runningGroup, dancingGroup, jumpingGroup])

  const groupRef = useRef<THREE.Group>(null!)
  const rigidBodyRef = useRef<RapierRigidBody>(null!)

  const { actions, names } = useAnimations(namedAnimations, groupRef)

  /* ── State ── */
  const [hovered, setHovered] = useState(false)
  const [currentAnimIdx, setCurrentAnimIdx] = useState(
    () => animations.findIndex((a) => a.name === animation),
  )
  const targetRef = useRef<THREE.Vector3 | null>(null)
  const isMovingRef = useRef(false)

  useCursor(hovered)

  /* ── Expose imperative handle ── */
  const handle: CharacterHandle = useMemo(() => ({
    setAnimation(name: AnimationName) {
      const idx = animations.findIndex((a) => a.name === name)
      if (idx >= 0) setCurrentAnimIdx(idx)
    },
    moveTo(x: number, z: number) {
      targetRef.current = new THREE.Vector3(x, 0, z)
      isMovingRef.current = true
    },
  }), [])

  useEffect(() => { onReady(handle) }, [handle, onReady])

  /* ── React to touchTarget prop changes ── */
  useEffect(() => {
    if (touchTarget) {
      handle.moveTo(touchTarget.x, touchTarget.z)
    }
  }, [touchTarget, handle])

  /* ── Animation switching ── */
  useEffect(() => {
    const name = names[currentAnimIdx]
    if (!name || !actions[name]) return

    actions[name]!.reset().fadeIn(0.3).play()
    onAnimationChange(name as AnimationName)

    return () => {
      actions[name]!.fadeOut(0.3)
    }
  }, [currentAnimIdx, names, actions, onAnimationChange])

  /* ── Click handler: cycle animations ── */
  const handleClick = useCallback(() => {
    setCurrentAnimIdx((prev) => (prev + 1) % names.length)
  }, [names])

  /* ── Movement + animation blend ── */
  useFrame(() => {
    if (!rigidBodyRef.current) return

    const body = rigidBodyRef.current
    const currentPos = body.translation()

    if (targetRef.current && isMovingRef.current) {
      const dx = targetRef.current.x - currentPos.x
      const dz = targetRef.current.z - currentPos.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < TARGET_THRESHOLD) {
        /* arrived */
        body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        isMovingRef.current = false
        targetRef.current = null
        /* switch to Idle if we're not doing a special anim */
        const dancingIdx = animations.findIndex((a) => a.name === 'Dancing')
        if (currentAnimIdx !== dancingIdx) {
          const idleIdx = names.indexOf('Idle')
          if (idleIdx >= 0) setCurrentAnimIdx(idleIdx)
        }
      } else {
        /* move toward target */
        const speed = currentAnimIdx === names.indexOf('Running') ? SPEED * 1.8 : SPEED
        const vx = (dx / dist) * speed
        const vz = (dz / dist) * speed
        body.setLinvel({ x: vx, y: body.linvel().y, z: vz }, true)

        /* rotate to face movement direction */
        const angle = Math.atan2(dx, dz)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          angle,
          0.1,
        )

        /* auto-blend: Walking or Running */
        if (speed > SPEED * 1.2) {
          const runningIdx = names.indexOf('Running')
          if (runningIdx >= 0 && currentAnimIdx !== runningIdx) {
            setCurrentAnimIdx(runningIdx)
          }
        } else {
          const walkingIdx = names.indexOf('Walking')
          if (walkingIdx >= 0 && currentAnimIdx !== walkingIdx && currentAnimIdx !== names.indexOf('Running')) {
            setCurrentAnimIdx(walkingIdx)
          }
        }
      }
    }

    /* sync mesh with rigid body (rapier drives position) */
    groupRef.current.position.set(currentPos.x, currentPos.y - 0.5, currentPos.z)
  })

  /* ── Render ── */
  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders="cuboid"
      enabledTranslations={[true, true, true]}
      enabledRotations={[false, false, false]}
      position={[0, 1, 0]}
      linearDamping={4}
      canSleep={false}
    >
      <group
        ref={groupRef}
        dispose={null}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); handleClick() }}
      >
        <group rotation={[Math.PI / 2, 0, 0]} scale={[0.01, 0.01, 0.01]}>
          <primitive object={(clonedScene as any).getObjectByName?.('mixamorigHips')} />
          {extractSkinnedMesh(clonedScene, texture)}
        </group>

        {/* Selection halo */}
        <mesh
          receiveShadow
          position={[0, -0.15, 0]}
          scale={hovered ? [1.2, 1.2, 1] : [1, 1, 1]}
        >
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial
            color={hovered ? '#6C63FF' : '#2a2a4e'}
            transparent
            opacity={hovered ? 0.6 : 0.3}
          />
        </mesh>
      </group>
    </RigidBody>
  )
}
