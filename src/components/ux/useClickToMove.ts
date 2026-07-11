import { useCallback, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

interface UseClickToMoveOptions {
  enabled?: boolean
  /** Called with world-space XZ coordinates when ground is clicked */
  onMove: (x: number, z: number) => void
}

/**
 * Hook that returns handlers for click-to-move on a 3D ground plane.
 *
 * Usage:
 * ```tsx
 * const { onPointerDown } = useClickToMove({ onMove: handleMove })
 * <mesh onPointerDown={onPointerDown} ... />
 * ```
 */
export function useClickToMove({ enabled = true, onMove }: UseClickToMoveOptions) {
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return

      /* only respond to main button / touch on the ground itself */
      if (e.delta > 5) return // ignore drags

      /* stop propagation so we don't also trigger character click */
      e.stopPropagation()

      const pointer = e.pointer
      if (!pointer) return

      /* intersect with infinite ground plane */
      raycaster.current.setFromCamera(
        new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        ),
        e.camera,
      )

      const target = new THREE.Vector3()
      const hit = raycaster.current.ray.intersectPlane(plane.current, target)
      if (hit) {
        onMove(target.x, target.z)
      }
    },
    [enabled, onMove],
  )

  return { onPointerDown: handlePointerDown }
}
