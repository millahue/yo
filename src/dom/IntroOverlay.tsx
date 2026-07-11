import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntroOverlayProps {
  onDismiss: () => void
}

export default function IntroOverlay({ onDismiss }: IntroOverlayProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    /* auto-dismiss after 4s or on any touch */
    const timer = setTimeout(() => {
      setVisible(false)
    }, 4000)

    const handleInteraction = () => {
      setVisible(false)
    }
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex flex-col items-center gap-6 px-6 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* ── Logo ── */}
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
              <span className="text-3xl font-bold text-white">yo</span>
            </div>

            <h2 className="text-2xl font-semibold text-white">
              Interactive Portfolio
            </h2>

            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Tap the character to cycle animations.
              <br />
              Tap the ground to move around.
              <br />
              Scroll to explore sections.
            </p>

            <button
              className="mt-4 px-8 py-3 rounded-xl bg-accent text-white font-medium text-sm
                         active:scale-95 transition-transform hover:bg-accent-light"
              onClick={() => setVisible(false)}
            >
              Get started
            </button>

            <p className="text-xs text-white/30 mt-2">— or tap anywhere —</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
