import React, { useCallback, useRef, useEffect, useState } from 'react'

interface JoyStickProps {
  onMove: (x: number, z: number) => void
}

const STICK_SIZE = 120
const KNOB_SIZE = 44
const DEAD_ZONE = 8

/**
 * Virtual joystick for mobile touch movement.
 * Sits at bottom-left — emits normalized direction vectors.
 */
export default function JoyStick({ onMove }: JoyStickProps) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const originRef = useRef({ x: 0, y: 0 })
  const knobRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  const updateKnob = useCallback((dx: number, dy: number) => {
    if (!knobRef.current) return
    const maxDist = STICK_SIZE / 2 - KNOB_SIZE / 2
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clampedDist = Math.min(dist, maxDist)
    const angle = Math.atan2(dy, dx)

    const clampedDx = Math.cos(angle) * clampedDist
    const clampedDy = Math.sin(angle) * clampedDist

    knobRef.current.style.transform = `translate(${clampedDx}px, ${clampedDy}px)`

    /* normalize to -1..1 */
    const nx = clampedDist > DEAD_ZONE ? (clampedDx / maxDist) : 0
    const ny = clampedDist > DEAD_ZONE ? (clampedDy / maxDist) : 0

    /* send movement: we map Y to Z in 3D space */
    onMove(nx, -ny)
  }, [onMove])

  const handleStart = useCallback((clientX: number, clientY: number) => {
    const rect = zoneRef.current?.getBoundingClientRect()
    if (!rect) return
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    setActive(true)
    cancelAnimationFrame(animFrameRef.current)
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!active) return
    const dx = clientX - originRef.current.x
    const dy = clientY - originRef.current.y
    updateKnob(dx, dy)
  }, [active, updateKnob])

  const handleEnd = useCallback(() => {
    setActive(false)
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }
    onMove(0, 0)
  }, [onMove])

  /* ── Touch handlers ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.touches[0]
    handleStart(t.clientX, t.clientY)
  }, [handleStart])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const t = e.touches[0]
    handleMove(t.clientX, t.clientY)
  }, [handleMove])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }, [handleEnd])

  /* cleanup animation frame */
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  /* only show on touch devices */
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  if (!isTouchDevice) return null

  return (
    <div
      ref={zoneRef}
      className="joystick-zone fixed bottom-8 left-6 z-30 rounded-full"
      style={{
        width: STICK_SIZE,
        height: STICK_SIZE,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={knobRef}
        className="absolute rounded-full"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          background: 'radial-gradient(circle, #6C63FF 0%, #5A52E0 100%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: active ? 'none' : 'transform 0.15s ease-out',
          boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
        }}
      />
    </div>
  )
}
