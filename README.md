<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/yo-6C63FF?style=for-the-badge&logo=three.js&logoColor=white&label=✨" />
    <img alt="yo" src="https://img.shields.io/badge/yo-6C63FF?style=for-the-badge&logo=three.js&logoColor=white&label=✨" />
  </picture>
</p>

<p align="center">
  <b>Interactive 3D portfolio</b> — Mixamo character · Rapier physics · FBX animations · Mobile-first
</p>

<p align="center">
  <img src="https://img.shields.io/badge/bun-1.x-black?logo=bun" alt="bun" />
  <img src="https://img.shields.io/badge/React_Three_Fiber-9.6-6C63FF?logo=react" alt="r3f" />
  <img src="https://img.shields.io/badge/Rapier-2.2-6C63FF?logo=gamejolt" alt="rapier" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="typescript" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite" alt="vite" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
</p>

---

## Table of Contents

- [Features](#features)
- [Stack](#stack)
- [Quick Start](#quick-start)
- [Assets — Mixamo Setup](#assets--mixamo-setup)
- [Controls](#controls)
- [Architecture](#architecture)
- [Customization](#customization)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [How It Works](#how-it-works)
- [Project Roadmap](#project-roadmap)
- [Credits](#credits)

---

## Features

- **🎮 Physics-based movement** — Click on the ground (or use the virtual joystick) and your character walks to that spot, driven by Rapier's WASM physics engine.
- **🔄 FBX animation system** — Load multiple Mixamo `.fbx` animations independently, crossfade between them with `fadeIn`/`fadeOut`. Tap the character to cycle.
- **📱 Mobile-first UI** — Bottom-sheet animation picker, virtual joystick for touch devices, hamburger fullscreen menu. Everything works on a phone screen.
- **🎥 Scroll-driven camera** — Scrolling navigates sections (Home, About, Work, Contact). Camera animates smoothly between predefined positions per section.
- **🧍 Animated character** — Mixamo GLB rig cloned via `SkeletonUtils.clone` so the model is reusable. Skinned mesh animations blend seamlessly.
- **✨ Ambient 3D world** — Floating, animated decorative shapes (DistortMaterial, WobbleMaterial) that respond to section changes.
- **🌀 Auto-blend movement** — Character automatically switches between Idle, Walking, and Running based on distance to target.
- **🌗 Intro overlay** — First-visit welcome screen with instructions, auto-dismisses on interaction.

---

## Stack

| Layer | Library | Version |
|---|---|---|
| React | `react` / `react-dom` | 19.x |
| 3D Renderer | `@react-three/fiber` | 9.6 |
| 3D Helpers | `@react-three/drei` | 10.7 |
| Physics Engine | `@react-three/rapier` (Rapier WASM) | 2.2 |
| Animation | Three.js `AnimationMixer` + `useFBX` + `useAnimations` | — |
| Motion | `framer-motion` | 11.x |
| Styling | Tailwind CSS | 3.4 |
| Build | Vite + TypeScript | 6.4 / 5.9 |
| Package Manager | **bun** | 1.x |
| 3D Math | `three-stdlib` (SkeletonUtils) | 2.35 |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/millahue/yo.git
cd yo

# 2. Install dependencies (with bun — 10-30x faster than npm)
bun install

# 3. Place your assets (see next section)

# 4. Start dev server
bun run dev
```

> **Open in browser:** [http://localhost:5173](http://localhost:5173)

---

## Assets — Mixamo Setup

This project uses **Mixamo** characters and animations. You need to provide:

### Required files

```
public/
├── models/
│   ├── character.glb       ← Mixamo-rigged character exported as GLB
│   └── character.jpg       ← Texture map (optional, model may embed it)
└── animations/
    ├── Idle.fbx
    ├── Walking.fbx
    ├── Running.fbx
    ├── Dancing.fbx
    └── Jumping.fbx
```

### Step-by-step: Get a Mixamo character

1. Go to **[mixamo.com](https://www.mixamo.com)** and sign in with your Adobe ID.

2. **Pick a character:**
   - Browse the **Characters** tab
   - Select any character (e.g., *X Bot*, *Y Bot*, or upload your own)
   - On the right panel, set **Format** → **FBX Binary** and **Skin** → **With Skin**
   - Click **Download** → you get a `.fbx` file

3. **Convert FBX to GLB (optional but recommended):**
   Mixamo exports FBX, but GLB loads faster in the browser. Use any converter:
   ```bash
   # Using Blender CLI:
   blender --background --python-expr "
   import bpy
   bpy.ops.import_scene.fbx(filepath='character.fbx')
   bpy.ops.export_scene.gltf(filepath='public/models/character.glb', export_format='GLB')
   "
   ```
   Or use an online converter like [gltf.report](https://gltf.report).
   
   > If you skip this step, rename the `.fbx` to `character.glb` — drei's `useGLTF` can load it.

4. **Get the texture:**
   - Open the `.fbx` in Blender or any 3D viewer
   - The texture is usually embedded or in the same folder
   - Save it as `public/models/character.jpg`

5. **Download animations:**
   - Go to the **Animations** tab in Mixamo
   - Search for each animation:
     - `Idle` (try "Idle", "Breathing Idle", "Standing Idle")
     - `Walking` (try "Walking", "Walk")
     - `Running` (try "Running", "Run", "Jogging")
     - `Dancing` (try "Dance", "Hip Hop Dance")
     - `Jumping` (try "Jump", "Jumping")
   - For each animation:
     - Select your character in the preview
     - Set **Format** → **FBX Without Skin** (important: no skin, just the animation data)
     - Click **Download**
     - Save as `public/animations/{Name}.fbx`

6. **Verify your structure:**
   ```bash
   ls public/models/
   # → character.glb  character.jpg
   ls public/animations/
   # → Idle.fbx  Walking.fbx  Running.fbx  Dancing.fbx  Jumping.fbx
   ```

### Alternative: Use the Stacy model (no download needed)

If you want to test immediately, download the Stacy model from the [pmndrs examples](https://github.com/pmndrs/examples/tree/main/demos/gltf-animations-re-used):

```bash
# Stacy GLB model
curl -o public/models/character.glb \
  https://raw.githubusercontent.com/pmndrs/examples/main/demos/gltf-animations-re-used/src/stacy.glb

# Stacy texture
curl -o public/models/character.jpg \
  https://raw.githubusercontent.com/pmndrs/examples/main/demos/gltf-animations-re-used/src/stacy.jpg
```

Then add your own FBX animations in `public/animations/`.

---

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| **Move** | Click on the ground plane | Virtual joystick (bottom-left) |
| **Cycle animations** | Click on the character | Tap the character in 3D |
| **Pick specific animation** | — | Tap the HUD badge → bottom sheet |
| **Navigate sections** | Scroll wheel / dot-nav dots (right edge) | Swipe scroll / hamburger menu |

### Visual feedback

- **Hover** over the character → blue selection halo expands
- **Moving** → character rotates smoothly toward destination
- **Animation switch** → 0.3s crossfade between clips
- **Camera transition** → spring-animated on section change

---

## Architecture

```
src/
├── canvas/                     # 3D world — runs inside <Canvas>
│   ├── Character.tsx           # Mixamo GLB + 5 FBX animations + Rapier RigidBody
│   ├── Ground.tsx              # Infinite plane with Rapier collider + click-to-move
│   ├── World.tsx               # Ambient/directional lights + floating shapes
│   ├── CameraController.tsx    # Spring-animated camera per section
│   ├── ScrollManager.tsx       # Scroll offset → section index sync
│   └── Movement.ts             # Math helpers (velocity, angle, distance)
│
├── dom/                        # HTML overlay — outside <Canvas>
│   ├── HUD.tsx                 # Top bar: brand logo + current animation badge
│   ├── IntroOverlay.tsx        # Welcome screen (auto-dismiss 4s or on tap)
│   └── Interface.tsx           # Per-section text content (scroll-linked)
│
├── components/
│   ├── ui/                     # Mobile-first reusable UI
│   │   ├── Navbar.tsx          # Hamburger → fullscreen menu + desktop dot-nav
│   │   ├── AnimationSelector.tsx  # Bottom sheet (spring-animated) for anims
│   │   ├── JoyStick.tsx        # Virtual analog stick (touch only)
│   │   └── MiniMap.tsx         # 2D radar dot (desktop only, placeholder)
│   └── ux/                     # Interaction hooks
│       ├── useClickToMove.ts   # Raycaster: ground click → world coordinates
│       ├── useTouchControls.ts # Raw pointer events → normalized direction
│       └── useAnimationBlend.ts  # Crossfade logic + movement-based auto-select
│
├── App.tsx                     # Root: Canvas + ScrollControls + Physics + UI
├── config.ts                   # Sections list, animation metadata, spring config
├── main.tsx                    # ReactDOM.createRoot entry
├── styles.css                  # Tailwind directives + glass, bottom-sheet, joystick
└── vite-env.d.ts               # Vite type shims (.glb?url, etc.)
```

### Data flow

```
User scrolls → ScrollManager → section index → CameraController (animate)
                                                  → World (show/hide shapes)
                                                  → Interface (show section text)

User clicks character → Character.onClick → cycle anim index → useAnimations.fadeIn/Out

User clicks ground → Ground.onPointerDown → useClickToMove (raycaster)
                  → App.handleMove → Character.moveTo → targetRef
                  → useFrame each frame → Rapier body.setLinvel → sync position
                  → auto-switch Walking/Running/Idle based on distance

User drags joystick → JoyStick (touch events) → App.handleMove → same path
```

---

## Customization

### 1. Add or change sections

Edit `src/config.ts`:

```ts
export const sections = [
  { id: 'home',    label: 'Home' },
  { id: 'about',   label: 'About' },
  { id: 'work',    label: 'Work' },
  { id: 'contact', label: 'Contact' },
]
```

Then update:
- `CameraController.tsx` → add camera positions for new sections
- `dom/Interface.tsx` → add section content
- `canvas/World.tsx` → adjust decorative shapes per section

### 2. Add a new animation

1. Place your `.fbx` in `public/animations/`
2. Add to `src/config.ts`:
   ```ts
   animations: [
     // ...existing...
     { name: 'Falling', file: 'animations/Falling.fbx', label: 'Fall', icon: '🪂' },
   ]
   ```
3. Load it in `Character.tsx`:
   ```ts
   const fallingGroup = useFBX(animFileMap['Falling'])
   // add to namedAnimations useMemo:
   clipFromFBX(fallingGroup, 'Falling'),
   ```

### 3. Adjust movement speed

In `Character.tsx`:
```ts
const SPEED = 3.5           // walking speed
const TARGET_THRESHOLD = 0.4 // distance at which character 'arrives'
```
Or change Running multiplier (line ~165):
```ts
const speed = currentAnimIdx === names.indexOf('Running') ? SPEED * 1.8 : SPEED
```

### 4. Camera positions

In `CanvasController.tsx`:
```ts
const sectionCameras = [
  { position: new THREE.Vector3(0, 5, 10), lookAt: new THREE.Vector3(0, 0, 0) },
  // ...
]
```

### 5. Theme / colors

Edit `tailwind.config.js`:
```js
colors: {
  accent: '#6C63FF',   // primary purple
  surface: '#0a0a0f',  // dark background
  panel: '#14141f',    // card/glass background
}
```

### 6. Physics fine-tuning

In `<RigidBody>` props:
```tsx
linearDamping={4}   // higher = more friction, slower stops
canSleep={false}    // keep body active always
```

---

## Building for Production

```bash
# Build (TypeScript check + Vite bundle)
bun run build

# Preview the production build locally
bun run preview
```

Output goes to `dist/`. Deploy anywhere: Vercel, Netlify, GitHub Pages, Cloudflare Pages.

### Optimizing bundle size

The Three.js bundle is ~3.6 MB (gzipped ~1.2 MB). To reduce it:

- **Code-split** the Canvas: `React.lazy(() => import('./canvas/Scene'))`
- **Use dynamic imports** for character models
- **Enable manual chunks** in `vite.config.ts`:
  ```ts
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  }
  ```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| **Character doesn't appear** | Missing model or wrong path | Check `public/models/character.glb` exists |
| **No animations play** | Missing FBX files | Check `public/animations/*.fbx` exist |
| **"Failed to load URL" in console** | Asset path mismatch | Verify paths in `config.ts` match file locations |
| **Clicking ground doesn't move character** | Camera angle / raycaster miss | Adjust `CameraController` positions; ground plane is Y=0 |
| **Blank screen on mobile** | WebGL not supported | Test on a device with WebGL 2.0 |
| **Build fails with TS errors** | Type mismatch | Run `bun run lint` to see specific errors |
| **Rapier physics glitchy** | RigidBody sleep settings | Set `canSleep={false}` on the character body |
| **Joystick not showing** | Desktop browser detected | Joystick auto-hides on non-touch devices (check `navigator.maxTouchPoints`) |

### Debug mode

Enable Leva (GUI debug panel) by uncommenting in `App.tsx`:
```tsx
import { Leva } from 'leva'
// ...
<Leva hidden />
```
Change to `<Leva />` (no `hidden`) to see the panel.

---

## How It Works

### Character pipeline

1. **Loading**: `useGLTF` loads the GLB → `SkeletonUtils.clone` creates a reusable copy (skinned meshes can't be used twice in Three.js without cloning).
2. **Animations**: `useFBX` loads each FBX as a `THREE.Group`, we extract `group.animations[0]`, name it, and pass to `useAnimations` together with the model's `ref`.
3. **Physics**: A `<RigidBody>` wraps the character group. Rapier manages velocity, collisions, and position.
4. **Movement loop**: `useFrame` reads the Rapier body's `translation()`, checks if a target exists, applies `setLinvel` toward it, and syncs the Three.js mesh position.
5. **Animation blend**: When `currentAnimIdx` changes, `useEffect` calls `action.reset().fadeIn(0.3).play()` and cleans up with `fadeOut(0.3)`.

### Scroll → section mapping

`ScrollControls` from drei creates a scrollable viewport. `ScrollManager` reads `scroll.offset` each frame and rounds it to the nearest section index, triggering camera and World animations.

### Mobile joystick

The `JoyStick` component captures `touchstart`/`touchmove`/`touchend`, calculates normalized displacement from the center, and passes `{x, z}` movement to the character. It only renders when a touch-capable device is detected.

---

## Project Roadmap

- [x] Basic 3D scene with Rapier physics
- [x] Mixamo GLB character with FBX animation loading
- [x] Click-to-move + joystick movement
- [x] Scroll-driven sections
- [x] Animation bottom sheet (mobile)
- [ ] Multi-character support (switch between models)
- [ ] Sound effects (footsteps per animation)
- [ ] Particle effects on arrival
- [ ] Procedural animation (idle breathing)
- [ ] Drag-to-rotate camera for desktop
- [ ] Voice command animation switching (Web Speech API)

---

## Credits

| Inspiration | What we borrowed |
|---|---|
| [wass08/r3f-portfolio-scroll-animations](https://github.com/wass08/r3f-portfolio-scroll-animations) | Scroll section architecture, Canvas/DOM split, FBX animation loading pattern |
| [pmndrs/examples/gltf-animations-re-used](https://github.com/pmndrs/examples/tree/main/demos/gltf-animations-re-used) | `SkeletonUtils.clone` + `useAnimations` for reusable skinned models |
| [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier) | Rapier physics integration, RigidBody, velocity-based movement |

---

<p align="center">
  Built with React 19 · R3F 9 · Rapier 2 · bun · TypeScript
</p>
