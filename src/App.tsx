import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { MotionConfig } from 'framer-motion'

import CameraController from './canvas/CameraController'
import ScrollManager from './canvas/ScrollManager'
import World from './canvas/World'
import Character from './canvas/Character'
import Ground from './canvas/Ground'

import HUD from './dom/HUD'
import IntroOverlay from './dom/IntroOverlay'
import Interface from './dom/Interface'

import Navbar from './components/ui/Navbar'
import AnimationSelector from './components/ui/AnimationSelector'
import JoyStick from './components/ui/JoyStick'

import { framerMotionConfig, sections, animations } from './config'

/* ── Types ── */
export type AnimationName = (typeof animations)[number]['name']

/* ── Character imperative handle ── */
export interface CharacterHandle {
  setAnimation: (name: AnimationName) => void
  moveTo: (x: number, z: number) => void
}

export default function App() {
  const [section, setSection] = useState(0)
  const [menuOpened, setMenuOpened] = useState(false)
  const [currentAnim, setCurrentAnim] = useState<AnimationName>('Idle')
  const [showIntro, setShowIntro] = useState(true)
  const [showAnimPicker, setShowAnimPicker] = useState(false)
  const [touchTarget, setTouchTarget] = useState<{ x: number; z: number } | null>(null)

  /* ref to child (character) will be wired via callback */
  const [characterRef, setCharacterRef] = useState<CharacterHandle | null>(null)

  /* close menu on section change */
  useEffect(() => { setMenuOpened(false) }, [section])

  /* dismiss intro on first interaction */
  const dismissIntro = useCallback(() => { setShowIntro(false) }, [])

  /* ── Handlers ── */
  const handleSelectAnim = useCallback((name: AnimationName) => {
    setCurrentAnim(name)
    characterRef?.setAnimation(name)
    setShowAnimPicker(false)
  }, [characterRef])

  const handleMove = useCallback((x: number, z: number) => {
    setTouchTarget({ x, z })
    characterRef?.moveTo(x, z)
  }, [characterRef])

  return (
    <MotionConfig transition={{ ...framerMotionConfig }}>
      <div className="relative w-full h-full overflow-hidden">
        {/* ── 3D Canvas (scroll-driven sections) ── */}
        <Canvas
          shadows
          camera={{ position: [0, 6, 12], fov: 45 }}
          gl={{ antialias: true }}
          onCreated={dismissIntro}
        >
          <color attach="background" args={['#0a0a0f']} />
          <fog attach="fog" args={['#0a0a0f', 18, 35]} />

          <ScrollControls pages={sections.length} damping={0.15}>
            <ScrollManager section={section} onSectionChange={setSection} />

            {/* ── 3D scene (scrolled) ── */}
            <Scroll>
              <Physics gravity={[0, -9.81, 0]}>
                <CameraController
                  section={section}
                  menuOpened={menuOpened}
                />
                <World section={section} />
                <Ground onMove={handleMove} />
                <Suspense fallback={null}>
                  <Character
                    animation={currentAnim}
                    onReady={setCharacterRef}
                    onAnimationChange={setCurrentAnim}
                    touchTarget={touchTarget}
                  />
                </Suspense>
              </Physics>
            </Scroll>

            {/* ── HTML overlay (scrollable text per section) ── */}
            <Interface />
          </ScrollControls>
        </Canvas>

        {/* ── DOM overlays (fixed, outside canvas) ── */}
        <HUD
          animation={currentAnim}
          onToggleAnimPicker={() => setShowAnimPicker((o) => !o)}
        />

        <Navbar
          section={section}
          onSectionChange={setSection}
          menuOpened={menuOpened}
          setMenuOpened={setMenuOpened}
        />

        {/* ── Mobile virtual joystick ── */}
        <JoyStick onMove={handleMove} />

        {/* ── Bottom sheet animation picker ── */}
        <AnimationSelector
          open={showAnimPicker}
          current={currentAnim}
          onSelect={handleSelectAnim}
          onClose={() => setShowAnimPicker(false)}
        />

        {/* ── Intro overlay (first visit) ── */}
        {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
      </div>
    </MotionConfig>
  )
}
