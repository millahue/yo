import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

interface ScrollManagerProps {
  section: number
  onSectionChange: (idx: number) => void
}

/**
 * Syncs drei ScrollControls scroll offset → section index.
 * Mirrors the pattern from wass08/r3f-portfolio-scroll-animations.
 */
export default function ScrollManager({
  section,
  onSectionChange,
}: ScrollManagerProps) {
  const scroll = useScroll()
  const lastSection = useRef(section)

  useFrame(() => {
    const current = Math.round(scroll.offset * (scroll.pages - 1))
    if (current !== lastSection.current) {
      lastSection.current = current
      onSectionChange(current)
    }
  })

  /* jump to section when prop changes externally (e.g. nav click) */
  useEffect(() => {
    if (section !== lastSection.current) {
      ;(scroll as any).scroll.current = section / (scroll.pages - 1)
      lastSection.current = section
    }
  }, [section, scroll])

  return null
}
