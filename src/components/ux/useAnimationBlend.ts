import { useEffect, useRef } from 'react'
import type { AnimationAction, AnimationMixer } from 'three'
import type { AnimationName } from '../../App'

interface UseAnimationBlendOptions {
  actions: Record<string, AnimationAction | null> | null
  currentAnim: AnimationName
  /** Duration of crossfade in seconds */
  fadeDuration?: number
}

/**
 * Smoothly crossfades between animations when `currentAnim` changes.
 *
 * Usage inside a component that already has `useAnimations`:
 * ```tsx
 * const { actions } = useAnimations(clips, ref)
 * useAnimationBlend({ actions, currentAnim })
 * ```
 */
export function useAnimationBlend({
  actions,
  currentAnim,
  fadeDuration = 0.3,
}: UseAnimationBlendOptions) {
  const prevAnimRef = useRef<AnimationName | null>(null)

  useEffect(() => {
    if (!actions) return

    const prev = prevAnimRef.current
    const next = currentAnim

    /* fade out previous */
    if (prev && actions[prev]) {
      actions[prev]!.fadeOut(fadeDuration)
    }

    /* fade in next */
    if (next && actions[next]) {
      actions[next]!.reset().fadeIn(fadeDuration).play()
    }

    prevAnimRef.current = next
  }, [currentAnim, actions, fadeDuration])
}

/**
 * Determines the appropriate animation based on movement state.
 * Useful for automatic blending between Idle ↔ Walk ↔ Run.
 */
export function getAnimationForMovement(params: {
  isMoving: boolean
  speed: number
  currentAnim: AnimationName
}): AnimationName {
  const { isMoving, speed, currentAnim } = params

  if (!isMoving) return 'Idle'

  if (speed > 0.7) return 'Running'

  if (speed > 0.1) return 'Walking'

  /* if dancing / jumping, don't override */
  if (currentAnim === 'Dancing' || currentAnim === 'Jumping') {
    return currentAnim
  }

  return 'Idle'
}
