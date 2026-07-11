import React from 'react'
import type { AnimationName } from '../App'
import { animations } from '../config'

interface HUDProps {
  animation: AnimationName
  onToggleAnimPicker: () => void
}

export default function HUD({ animation, onToggleAnimPicker }: HUDProps) {
  const meta = animations.find((a) => a.name === animation)

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
        {/* ── Brand ── */}
        <div className="glass rounded-xl px-4 py-2 pointer-events-auto">
          <h1 className="text-sm font-semibold tracking-wider text-white/80">
            YO
          </h1>
        </div>

        {/* ── Current animation indicator (tappable) ── */}
        <button
          className="glass rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform"
          onClick={onToggleAnimPicker}
          aria-label="Change animation"
        >
          <span className="text-sm">{meta?.icon ?? '⟳'}</span>
          <span className="text-xs font-medium text-white/70">
            {meta?.label ?? 'Idle'}
          </span>
        </button>
      </div>
    </div>
  )
}
