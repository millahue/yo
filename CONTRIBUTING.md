# Contributing to yo

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **yo**. These are just guidelines, not rules — use your best judgment and feel free to propose changes to this document.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Component Architecture Guide](#component-architecture-guide)
- [Coding Guidelines](#coding-guidelines)
- [Communication Between Layers](#communication-between-layers)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Adding Assets](#adding-assets)
- [Questions?](#questions)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How to Contribute

### 🐛 Report a Bug

Open an [issue](https://github.com/millahue/yo/issues/new/choose) using the **Bug Report** template. Include:

- Clear steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, device, bun version)
- Console output, if any

### 💡 Suggest a Feature

Open an [issue](https://github.com/millahue/yo/issues/new/choose) using the **Feature Request** template. Describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### 📝 Improve Documentation

Documentation improvements are always welcome — typos, clarifications, examples, translations. Just open a PR.

### 🧪 Add an Animation

See [Adding Assets](#adding-assets) below.

### 💻 Contribute Code

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-feature` or `fix/my-bug`
3. Make your changes
4. Ensure builds pass: `bun run lint && bun run build`
5. Commit following [our convention](#commit-convention)
6. Push and open a Pull Request

---

## Development Setup

### Prerequisites

- **bun** ≥ 1.x ([install](https://bun.sh/docs/installation))
- Node.js 20+ (bun uses this for some compat features)

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/yo.git
cd yo

# Install dependencies (use bun, not npm)
bun install

# Start dev server
bun run dev
```

### Commands

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server (HMR) |
| `bun run build` | TypeScript check + Vite production build |
| `bun run preview` | Serve the production build locally |
| `bun run lint` | Run TypeScript type-check only |

> ⚠️ Never use `npm` or `npx`. Use `bun` and `bunx` instead.

---

## Component Architecture Guide

This project has a deliberate architecture split. Understanding *why* each directory exists is critical before adding new components.

### The Canvas / DOM Split

```
src/
├── canvas/     ← Runs INSIDE <Canvas> (3D, WebGL, Three.js)
├── dom/        ← Runs OUTSIDE <Canvas> (React DOM, HTML, CSS)
├── components/
│   ├── ui/     ← Reusable DOM widgets (Touch-friendly, mobile-first)
│   └── ux/     ← Interaction hooks (Abstract logic, no JSX)
```

**Why this split?**

React Three Fiber's `<Canvas>` creates a separate React reconciler. Components inside it render to WebGL, not the DOM. This means:

| Inside `<Canvas>` | Outside `<Canvas>` |
|---|---|
| Three.js objects (mesh, lights, group) | HTML elements (div, button, p) |
| `useFrame`, `useThree` hooks | `useEffect`, `useState` normal React |
| 3D coordinates | CSS layout (flexbox, grid) |
| Perspective camera | Viewport units (vw, vh) |
| `onPointerDown`, `onPointerOver` events | `onClick`, `onTouchStart` events |

**You cannot** mix HTML inside `<Canvas>` or Three.js outside it. This is enforced by the framework.

---

### Decision Tree: Where Does My New Component Go?

When adding a new component, ask these questions in order:

```
┌─ Does it render a 3D object? (mesh, model, light, particle)
│  YES → src/canvas/
│
└─ Does it render HTML that overlays the 3D scene?
   │
   ├─ Is it a reusable UI widget? (button, sheet, stick, map)
   │  YES → src/components/ui/
   │
   ├─ Is it single-use, tied to a specific section/page?
   │  YES → src/dom/
   │
   └─ Does it have NO JSX and just contain logic/hooks?
      YES → src/components/ux/
```

---

### `src/canvas/` — 3D World Components

**What goes here:** Every component that renders inside `<Canvas>` and produces Three.js objects.

**Why separate from the rest:** These components use a different React reconciler (`react-three-fiber`). They cannot contain HTML. They have access to `useFrame`, `useThree`, and all Three.js primitives.

**Current components:**

| Component | Purpose | Props interface | Key hooks used |
|---|---|---|---|
| `Character.tsx` | Mixamo GLB model + FBX animations + Rapier RigidBody | `CharacterProps: { animation, onReady, onAnimationChange, touchTarget }` | `useGLTF`, `useFBX`, `useAnimations`, `useFrame`, `useCursor` |
| `Ground.tsx` | Infinite physical plane with click-to-move | `GroundProps: { onMove? }` | `RigidBody`, `useClickToMove` |
| `World.tsx` | Lights + floating decorative shapes | `WorldProps: { section }` | `useFrame`, `useMotionValue` |
| `CameraController.tsx` | Spring-animated camera per section | `CameraControllerProps: { section, menuOpened }` | `useFrame`, `useThree`, `useMotionValue` |
| `ScrollManager.tsx` | Syncs scroll offset → section index | `ScrollManagerProps: { section, onSectionChange }` | `useScroll`, `useFrame` |
| `Movement.ts` | Pure math utilities (no JSX) | — (exported functions) | None |

**When to create a new `canvas/` component:**

| Scenario | Example |
|---|---|
| A new 3D model enters the scene | Adding a pet that follows the character |
| An environmental effect | Rain particles, fog, portal, reflections |
| A new physics object | Moving platforms, doors, collectible items |
| Custom lighting setup | Day/night cycle, volumetric light |
| A weapon or tool the character holds | Sword, flashlight, magic wand |
| A camera behavior | Orbit controls, cinematic dolly, shake on impact |

**Example: Adding a collectible gem**

```tsx
// src/canvas/Gem.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface GemProps {
  position: [number, number, number]
  onCollect?: () => void
}

export default function Gem({ position, onCollect }: GemProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 1.5
    meshRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.002
  })

  return (
    <RigidBody type="fixed" sensor onIntersectionEnter={onCollect}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial color="#6C63FF" emissive="#6C63FF" emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  )
}
```

**Where to render it:** In `App.tsx` inside `<Physics>`:
```tsx
<Gem position={[2, 0.5, -3]} onCollect={() => console.log('Collected!')} />
```

**Why `canvas/` and not `components/ui/`?** Because `<octahedronGeometry>` is a Three.js primitive that only works inside `<Canvas>`. It interacts with Rapier physics and uses `useFrame` for per-frame animation.

---

### `src/dom/` — HTML Overlay Components

**What goes here:** Single-use components that render HTML *over* the 3D canvas but are tied to specific pages, sections, or overlay use cases.

**Why separate from `components/ui/`:** These are *not reusable*. They are specific to the portfolio layout. If a component could be used in another project as-is, it belongs in `components/ui/`.

**Current components:**

| Component | Purpose | Why it's here (not ui/) |
|---|---|---|
| `HUD.tsx` | Top bar with brand + animation indicator | Specific to this portfolio's header layout |
| `IntroOverlay.tsx` | First-visit welcome screen | Specific onboarding flow, single-use |
| `Interface.tsx` | Per-section text content | Tightly coupled to `config.ts` sections array |

**When to create a new `dom/` component:**

| Scenario | Example |
|---|---|
| A full-screen loading screen | Custom loading spinner while model loads |
| A "section complete" animation | Confetti overlay when reaching Contact section |
| A character speech bubble | Dialog that shows per animation change |
| A settings panel for the 3D scene | Toggle wireframe, change colors |
| A mini-tutorial overlay | Step-by-step guide on first visit |

**Example: Adding a loading screen**

```tsx
// src/dom/LoadingScreen.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onLoaded: () => void
}

export default function LoadingScreen({ onLoaded }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(onLoaded, 300)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 200)
    return () => clearInterval(interval)
  }, [onLoaded])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>
      <p className="text-white/40 text-xs mt-4">Loading your experience...</p>
    </motion.div>
  )
}
```

**Where to render it:** In `App.tsx` outside `<Canvas>`:
```tsx
const [loading, setLoading] = useState(true)
// ...
{loading && <LoadingScreen onLoaded={() => setLoading(false)} />}
```

**Why `dom/` and not `canvas/`?** Because it renders `<div>`, `<p>`, and framer-motion's `motion.div` — all HTML elements. It lives outside `<Canvas>` and has zero Three.js dependencies.

---

### `src/components/ui/` — Reusable UI Components

**What goes here:** Touch-friendly, mobile-first HTML components that could be extracted into their own library. They have no knowledge of the 3D scene.

**Why this exists:** These components are *framework-agnostic* regarding the 3D layer. They receive props and emit callbacks. They don't import from `@react-three/fiber` or `three`.

**Current components:**

| Component | Props | Reusability |
|---|---|---|
| `Navbar.tsx` | `{ section, onSectionChange, menuOpened, setMenuOpened }` | Specific nav pattern, but generic enough |
| `AnimationSelector.tsx` | `{ open, current, onSelect, onClose }` | Generic bottom-sheet selector |
| `JoyStick.tsx` | `{ onMove }` | Pure touch joystick, no 3D deps |
| `MiniMap.tsx` | (none yet — placeholder) | Generic 2D radar |

**How to know if something belongs in `ui/`:**

> If you can copy-paste this component into a different React project (no 3D, no Three.js) and it still makes sense, put it in `components/ui/`.

**When to create a new `ui/` component:**

| Scenario | Example |
|---|---|
| A button/control used in multiple places | `ActionButton.tsx` with loading state |
| A modal or dialog pattern | `Dialog.tsx` reusable overlay |
| A slider or range input | `Slider.tsx` for camera distance control |
| A toggle switch | `Toggle.tsx` for dark mode / wireframe |
| A badge or chip | `Badge.tsx` for animation names |
| A progress bar | `ProgressBar.tsx` for loading |

**Example: Adding a generic ActionButton**

```tsx
// src/components/ui/ActionButton.tsx
import React from 'react'

interface ActionButtonProps {
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-light',
  secondary: 'glass text-white/80 hover:bg-white/10',
  ghost: 'text-white/50 hover:text-white/80',
}

export default function ActionButton({
  label,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all
        active:scale-95 disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
      )}
    </button>
  )
}
```

**Where to use it:** Any DOM component:
```tsx
import ActionButton from '../components/ui/ActionButton'

<ActionButton
  label="Reset Camera"
  icon="🎥"
  variant="secondary"
  onClick={() => resetCamera()}
/>
```

**Why `ui/` and not `dom/`?** Because `ActionButton` has no knowledge of the portfolio. It's a generic button that could be used in any project.

---

### `src/components/ux/` — Interaction Hooks

**What goes here:** Custom React hooks that encapsulate interaction logic. They have **no JSX**. They may use Three.js or React primitives internally.

**Why this exists:** Separating logic from presentation makes both testable and reusable. These hooks are the "brain" — components are the "face".

**Current hooks:**

| Hook | Input | Output | Purpose |
|---|---|---|---|
| `useClickToMove` | `{ enabled, onMove }` | `{ onPointerDown }` | Raycaster: ground click → world coords |
| `useTouchControls` | `{ onMove, onTap }` | `{ bind }` | Raw touch → normalized direction |
| `useAnimationBlend` | `{ actions, currentAnim, fadeDuration }` | — (side-effect) | Crossfade between animation clips |

**When to create a new `ux/` hook:**

| Scenario | Example |
|---|---|
| A complex interaction sequence | `useDragToRotate` — drag gesture → camera orbit |
| Keyboard/gamepad input | `useKeyboardControls` — WASD movement |
| Physics query logic | `useGroundIntersection` — is position on ground? |
| Animation state machine | `useCharacterState` — idle/walk/run/jump FSM |
| Device capability detection | `useDeviceCapabilities` — WebGL, touch, performance |
| Data fetching for 3D assets | `useModelPreloader` — preload GLB + textures |

**Example: Adding keyboard controls**

```tsx
// src/components/ux/useKeyboardControls.ts
import { useEffect, useRef } from 'react'

interface UseKeyboardControlsOptions {
  onMove: (x: number, z: number) => void
  onAction?: () => void
}

const keys = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  action: ['Space', 'KeyE'],
}

export function useKeyboardControls({ onMove, onAction }: UseKeyboardControlsOptions) {
  const pressedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      pressedRef.current.add(e.code)
      if (keys.action.includes(e.code)) onAction?.()
    }
    const handleUp = (e: KeyboardEvent) => {
      pressedRef.current.delete(e.code)
    }

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)

    // Poll keys at ~60fps
    const interval = setInterval(() => {
      let x = 0
      let z = 0
      if (pressedRef.current.has('KeyD') || pressedRef.current.has('ArrowRight')) x += 1
      if (pressedRef.current.has('KeyA') || pressedRef.current.has('ArrowLeft')) x -= 1
      if (pressedRef.current.has('KeyW') || pressedRef.current.has('ArrowUp')) z -= 1
      if (pressedRef.current.has('KeyS') || pressedRef.current.has('ArrowDown')) z += 1
      onMove(x, z)
    }, 16)

    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      clearInterval(interval)
    }
  }, [onMove, onAction])
}
```

**Where to use it:** In `Character.tsx` or `App.tsx`:
```tsx
const { bind } = useKeyboardControls({
  onMove: (x, z) => handleMove(x, z),
  onAction: () => characterRef?.setAnimation('Dancing'),
})
```

**Why `ux/` and not `canvas/`?** Because this hook contains zero JSX, zero Three.js primitives. It's pure logic. It could be used to control a 2D canvas character just as easily.

---

## Coding Guidelines

### General

- **Language**: TypeScript (strict mode). Avoid `any` when possible.
- **Framework**: React 19 with functional components and hooks.
- **3D**: All Three.js related code lives under `src/canvas/`.
- **DOM**: All HTML overlay lives under `src/dom/`.
- **UI**: Reusable UI components under `src/components/ui/`.
- **UX**: Custom hooks under `src/components/ux/`.

### Component patterns

- Each component is a **default-exported function**
- Props are typed with an **interface** named `ComponentNameProps`
- Complex logic is extracted to **custom hooks**
- Three.js objects are manipulated via **refs + `useFrame`**, not via state
- Side effects go in **`useEffect`** or **`useFrame`** depending on the reconciler

### Naming conventions

| Pattern | Example | Where |
|---|---|---|
| PascalCase functional component | `AnimationSelector` | All components |
| `use` prefix for hooks | `useClickToMove` | `components/ux/` |
| camelCase utilities | `velocityTowardTarget` | `canvas/Movement.ts` |
| SCREAMING_SNAKE constants | `MOVE_SPEED` | Inside component files |

### Props interface pattern

```tsx
// ✅ Correct — interface exported, props destructured
interface BadgeProps {
  label: string
  variant?: 'default' | 'active'
  onClick?: () => void
}

export default function Badge({ label, variant = 'default', onClick }: BadgeProps) {
  // ...
}
```

### Hook pattern

```tsx
// ✅ Correct — hook returns object with handlers/bindings
export function useMyFeature({ onEvent }: Options) {
  // internal refs, state, effects
  return {
    handlers: { onClick, onPointerDown },
    state: { isLoading, value },
  }
}
```

### Animation conventions

- Each animation is a separate `.fbx` file in `public/animations/`
- Animation metadata is registered in `src/config.ts`
- Crossfade duration is 0.3s (adjustable in `Character.tsx`)
- The character auto-blends between Idle / Walking / Running based on movement

### Styling

- Tailwind CSS utility classes
- Custom glass effects in `styles.css`
- Mobile-first responsive design
- Joystick only shows on touch-capable devices
- Bottom sheets use `cubic-bezier(0.32, 0.72, 0, 1)` for iOS-like spring

---

## Communication Between Layers

Components in different directories need to communicate. Here's how:

### Canvas → DOM (3D scene tells HTML about something)

Use **callbacks passed as props** through `App.tsx`:

```tsx
// App.tsx bridges the two worlds:
<Canvas>
  <Character onAnimationChange={(name) => setCurrentAnim(name)} />
</Canvas>

<HUD animation={currentAnim} />  {/* DOM reads state */}
```

### DOM → Canvas (user clicks HTML, 3D reacts)

Use **imperative handles** via `useImperativeHandle` + `forwardRef`:

```tsx
// Character exposes:
export interface CharacterHandle {
  setAnimation: (name: AnimationName) => void
  moveTo: (x: number, z: number) => void
}

// DOM calls it:
<button onClick={() => characterRef?.setAnimation('Dancing')}>
  Dance!
</button>
```

### Within Canvas (3D → 3D)

Use **React props** or **zustand** for shared state:

```tsx
// zustand store (if needed):
import { create } from 'zustand'
export const useGameStore = create((set) => ({
  score: 0,
  collect: () => set((s) => ({ score: s.score + 1 })),
}))

// In any canvas component:
const score = useGameStore((s) => s.score)
```

### Within DOM (HTML → HTML)

Standard React patterns: props, context, zustand, or framer-motion's `MotionConfig`.

---

## Commit Convention

We use **semantic commits**. Every commit message must follow this format:

```
<type>: <short description>

[optional body with details]
```

### Types

| Type     | Usage                                   |
|----------|------------------------------------------|
| `feat`   | A new feature                           |
| `fix`    | A bug fix                               |
| `docs`   | Documentation changes                   |
| `chore`  | Maintenance, deps, config, tooling       |
| `refactor` | Code change with no feature/fix       |
| `style`  | Code style changes (formatting, etc.)    |
| `test`   | Adding or updating tests                |
| `perf`   | Performance improvement                 |

### Examples

```
feat: add orbit camera controls for desktop
fix: character not moving after ground click on Safari
docs: add Mixamo setup GIF to README
chore: update drei from 10.7.0 to 10.7.7
refactor: extract movement logic into useCharacterMovement hook
```

### Scope (optional but encouraged)

Add a scope in parentheses after the type:

```
feat(canvas): add collectible gem with Rapier sensor
fix(ui): joystick not resetting on touch end
docs(contributing): add component architecture guide
chore(deps): update three from 0.173 to 0.174
```

---

## Pull Request Process

1. **Before opening a PR**, ensure your branch is up to date with `main`.
2. Run `bun run lint && bun run build` — both must pass.
3. If your change affects the UI, include a screenshot or screen recording.
4. Fill out the PR template completely.
5. A maintainer will review your PR within a few days.
6. Address any review feedback. Once approved, it will be merged.

### PR Checklist

- [ ] I've placed the component in the correct directory (`canvas/`, `dom/`, `ui/`, or `ux/`)
- [ ] Props are typed with an interface
- [ ] Complex logic is in a custom hook
- [ ] No HTML inside canvas components, no Three.js outside
- [ ] Mobile-first: touch events work, UI adapts
- [ ] `bun run lint && bun run build` passes

---

## Adding Assets

### Adding a new animation

1. Download an `.fbx` (without skin) from [Mixamo](https://www.mixamo.com)
2. Place it in `public/animations/YourAnimation.fbx`
3. Register it in `src/config.ts`:
   ```ts
   animations: [
     // ...existing
     { name: 'YourAnimation', file: 'animations/YourAnimation.fbx', label: 'Your Animation', icon: '🎯' },
   ]
   ```
4. Load it in `src/canvas/Character.tsx`:
   ```ts
   const yourAnimGroup = useFBX(animFileMap['YourAnimation'])
   // In namedAnimations useMemo:
   clipFromFBX(yourAnimGroup, 'YourAnimation'),
   ```

### Adding a new character model

1. Export your Mixamo character as GLB (`public/models/`)
2. Update the texture path in `Character.tsx`
3. If the mesh/skeleton names differ from `mixamorigHips`, update the `extractSkinnedMesh` helper

---

## Questions?

Open a [Discussion](https://github.com/millahue/yo/discussions) or reach out to the maintainers via GitHub issues.

---

> This CONTRIBUTING.md is adapted for the **yo** project. Thank you for helping make it better!
