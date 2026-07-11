import { useCallback, useRef, useEffect } from 'react'

interface TouchState {
  active: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface UseTouchControlsOptions {
  /** Called with normalized direction (x, z) each frame while touching */
  onMove: (x: number, z: number) => void
  onTap?: () => void
}

/**
 * Captures raw touch gestures and maps them to movement.
 * Used as a simpler alternative to the visual JoyStick component.
 * This hook attaches to a given element ref.
 */
export function useTouchControls({ onMove, onTap }: UseTouchControlsOptions) {
  const touchRef = useRef<TouchState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      currentX: t.clientX,
      currentY: t.clientY,
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchRef.current.active) return
    const t = e.touches[0]
    touchRef.current.currentX = t.clientX
    touchRef.current.currentY = t.clientY

    const dx = t.clientX - touchRef.current.startX
    const dy = t.clientY - touchRef.current.startY
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.15

    const nx = Math.max(-1, Math.min(1, dx / maxDist))
    const ny = Math.max(-1, Math.min(1, dy / maxDist))

    onMove(nx, -ny) // negate Y because screen Y is inverted relative to world Z
  }, [onMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const t = e.changedTouches[0]
    const dx = Math.abs(t.clientX - touchRef.current.startX)
    const dy = Math.abs(t.clientY - touchRef.current.startY)

    if (dx < 10 && dy < 10) {
      onTap?.()
    }

    touchRef.current.active = false
    onMove(0, 0)
  }, [onMove, onTap])

  const bind = (element: HTMLElement | null) => {
    if (!element) return
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }

  return { bind }
}
