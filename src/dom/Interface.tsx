import React from 'react'
import { Scroll } from '@react-three/drei'
import { sections } from '../config'

/**
 * Scrollable HTML overlay — one "page" per section.
 * Mirrors the wass08/r3f-portfolio-scroll-animations Interface pattern.
 */
export default function Interface() {
  return (
    <Scroll html>
      <div className="relative w-[400vw] h-full">
        {sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="absolute top-0 w-screen h-screen flex items-center justify-center px-6"
            style={{ left: `${i * 100}vw` }}
          >
            <div className="max-w-md text-center">
              {i === 0 && (
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-white">
                    Welcome to <span className="text-accent">yo</span>
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    An interactive 3D portfolio built with React Three Fiber,
                    Rapier physics, and Mixamo animations.
                  </p>
                </div>
              )}

              {i === 1 && (
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-white">About</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Tap the character to cycle through animations.
                    Click the ground or use the joystick to move around.
                  </p>
                </div>
              )}

              {i === 2 && (
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-white">Work</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Scroll-based storytelling with 3D transitions.
                    Each section is a new camera angle and scene composition.
                  </p>
                </div>
              )}

              {i === 3 && (
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold text-white">Contact</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Built with React 19, R3F 9, Rapier 2, and TypeScript.
                  </p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </Scroll>
  )
}
