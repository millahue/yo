import React from 'react'

/**
 * Minimal 2D radar showing character position on the ground.
 * For now a placeholder — can be wired to character position via context/zustand later.
 */
export default function MiniMap() {
  return (
    <div className="fixed bottom-8 right-6 z-30 glass rounded-2xl p-3 w-24 h-24 hidden md:flex flex-col items-center justify-center">
      <div className="relative w-full h-full rounded-full bg-white/5 border border-white/10">
        {/* center dot — character position */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50" />
      </div>
    </div>
  )
}
