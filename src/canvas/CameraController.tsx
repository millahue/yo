import { useFrame, useThree } from '@react-three/fiber'
import { animate, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'
import * as THREE from 'three'
import { framerMotionConfig } from '../config'

interface CameraControllerProps {
  section: number
  menuOpened: boolean
}

/* Per-section camera positions */
const sectionCameras: Array<{ position: THREE.Vector3; lookAt: THREE.Vector3 }> = [
  { position: new THREE.Vector3(0, 5, 10),   lookAt: new THREE.Vector3(0, 0, 0) },
  { position: new THREE.Vector3(0, 4, 4),    lookAt: new THREE.Vector3(0, 0, -5) },
  { position: new THREE.Vector3(0, 3, 6),    lookAt: new THREE.Vector3(0, 0, -10) },
  { position: new THREE.Vector3(0, 4, 8),    lookAt: new THREE.Vector3(0, 0, -14) },
]

export default function CameraController({ section, menuOpened }: CameraControllerProps) {
  const { camera } = useThree()
  const camPosX = useMotionValue(camera.position.x)
  const camPosY = useMotionValue(camera.position.y)
  const camPosZ = useMotionValue(camera.position.z)
  const lookAtX = useMotionValue(0)
  const lookAtY = useMotionValue(0)
  const lookAtZ = useMotionValue(0)

  /* section changes → animate camera */
  useEffect(() => {
    const target = sectionCameras[Math.min(section, sectionCameras.length - 1)]
    const menuOffset = menuOpened ? -3 : 0

    animate(camPosX, target.position.x + menuOffset, framerMotionConfig)
    animate(camPosY, target.position.y, framerMotionConfig)
    animate(camPosZ, target.position.z, framerMotionConfig)
    animate(lookAtX, target.lookAt.x - menuOffset, framerMotionConfig)
    animate(lookAtY, target.lookAt.y, framerMotionConfig)
    animate(lookAtZ, target.lookAt.z, framerMotionConfig)
  }, [section, menuOpened])

  useFrame(() => {
    camera.position.set(camPosX.get(), camPosY.get(), camPosZ.get())
    camera.lookAt(lookAtX.get(), lookAtY.get(), lookAtZ.get())
  })

  return null
}
