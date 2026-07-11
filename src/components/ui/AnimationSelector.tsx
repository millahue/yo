import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AnimationName } from '../../App'
import { animations } from '../../config'

interface AnimationSelectorProps {
  open: boolean
  current: AnimationName
  onSelect: (name: AnimationName) => void
  onClose: () => void
}

export default function AnimationSelector({
  open,
  current,
  onSelect,
  onClose,
}: AnimationSelectorProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* bottom sheet */}
          <motion.div
            className="bottom-sheet glass z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            <h3 className="text-sm font-semibold text-white/60 px-5 pb-2">
              Animations
            </h3>

            <div className="flex flex-col gap-1 px-3 pb-4">
              {animations.map((anim) => {
                const isActive = anim.name === current
                return (
                  <button
                    key={anim.name}
                    className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-colors
                      ${
                        isActive
                          ? 'bg-accent/20 text-accent'
                          : 'text-white/70 active:bg-white/5'
                      }`}
                    onClick={() => onSelect(anim.name)}
                  >
                    <span className="text-xl">{anim.icon}</span>
                    <span className="text-sm font-medium">{anim.label}</span>

                    {isActive && (
                      <span className="ml-auto text-accent text-xs font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
