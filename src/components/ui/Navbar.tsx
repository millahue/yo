import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sections } from '../../config'

interface NavbarProps {
  section: number
  onSectionChange: (idx: number) => void
  menuOpened: boolean
  setMenuOpened: (v: boolean) => void
}

export default function Navbar({
  section,
  onSectionChange,
  menuOpened,
  setMenuOpened,
}: NavbarProps) {
  return (
    <>
      {/* ── Hamburger ── */}
      <button
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center
                   pointer-events-auto active:scale-90 transition-transform"
        onClick={() => setMenuOpened(!menuOpened)}
        aria-label="Toggle menu"
      >
        <div className="flex flex-col gap-1">
          <span
            className={`block w-5 h-[2px] bg-white/70 transition-transform ${
              menuOpened ? 'rotate-45 translate-y-[3px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-white/70 transition-opacity ${
              menuOpened ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-white/70 transition-transform ${
              menuOpened ? '-rotate-45 -translate-y-[3px]' : ''
            }`}
          />
        </div>
      </button>

      {/* ── Full-screen menu overlay ── */}
      <AnimatePresence>
        {menuOpened && (
          <motion.nav
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="flex flex-col items-center gap-8">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <button
                    className={`text-2xl font-medium transition-colors ${
                      section === i
                        ? 'text-accent'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                    onClick={() => onSectionChange(i)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Desktop dot-nav (hidden on mobile) ── */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              section === i
                ? 'bg-accent scale-125'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            onClick={() => onSectionChange(i)}
            aria-label={s.label}
          />
        ))}
      </div>
    </>
  )
}
