import * as THREE from 'three'

/* ── Constants ── */
export const MOVE_SPEED = 3.5
export const RUN_SPEED = 6.5
export const TARGET_REACHED_DIST = 0.4

/* ── Types ── */
export interface MoveTarget {
  x: number
  z: number
}

/* ── Utility: angle from current pos to target ── */
export function angleToTarget(
  current: THREE.Vector3,
  target: MoveTarget,
): number {
  return Math.atan2(target.x - current.x, target.z - current.z)
}

/* ── Utility: distance to target (2D XZ) ── */
export function distToTarget(
  current: THREE.Vector3,
  target: MoveTarget,
): number {
  const dx = target.x - current.x
  const dz = target.z - current.z
  return Math.sqrt(dx * dx + dz * dz)
}

/* ── Utility: compute velocity toward target ── */
export function velocityTowardTarget(
  current: { x: number; z: number },
  target: MoveTarget,
  speed: number,
): { x: number; y: number; z: number } {
  const dx = target.x - current.x
  const dz = target.z - current.z
  const dist = Math.sqrt(dx * dx + dz * dz)

  if (dist < TARGET_REACHED_DIST) {
    return { x: 0, y: 0, z: 0 }
  }

  return {
    x: (dx / dist) * speed,
    y: 0,
    z: (dz / dist) * speed,
  }
}
