# yo — Interactive 3D Portfolio

A React Three Fiber portfolio featuring a Mixamo-rigged character with physics-based movement (Rapier), FBX animations, scroll-driven sections, and a mobile-first UI.

## Stack

| Layer | Library |
|---|---|
| Renderer | `@react-three/fiber` 9.x |
| Helpers | `@react-three/drei` 10.x |
| Physics | `@react-three/rapier` 2.x |
| Animation | Three.js `AnimationMixer` + FBX via `useFBX` |
| Motion | `framer-motion` 11.x + `framer-motion-3d` |
| Styling | Tailwind CSS 3.x |
| Build | Vite 6 + TypeScript |

## Quick start

```bash
npm install
npm run dev
```

## Assets you need to provide

Place these files under `public/`:

```
public/
├── models/
│   ├── character.glb       # Mixamo-rigged character (GLB)
│   └── character.jpg       # Texture map
└── animations/
    ├── Idle.fbx
    ├── Walking.fbx
    ├── Running.fbx
    ├── Dancing.fbx
    └── Jumping.fbx
```

**Get Mixamo animations:**
1. Go to [mixamo.com](https://www.mixamo.com)
2. Upload your character → download as **FBX without skin**
3. Download `Idle`, `Walking`, `Running`, `Dancing`, `Jumping`
4. Place FBX files in `public/animations/` and your model in `public/models/`

> You can also use the Stacy model from [pmndrs examples](https://github.com/pmndrs/examples/tree/main/demos/gltf-animations-re-used) by placing `stacy.glb` as `public/models/character.glb`.

## Architecture

```
src/
├── canvas/           # R3F 3D components
│   ├── Character.tsx  # GLB model + FBX anims + Rapier rigid body
│   ├── Ground.tsx     # Physical ground plane with click-to-move
│   ├── World.tsx      # Lights + floating decorative shapes
│   ├── CameraController.tsx  # Section-driven camera animation
│   ├── ScrollManager.tsx     # Scroll ↔ section sync
│   └── Movement.ts           # Movement math utilities
├── dom/              # HTML overlay (scrollable)
│   ├── HUD.tsx        # Top bar: brand + animation indicator
│   ├── IntroOverlay.tsx  # Welcome screen (auto-dismiss)
│   └── Interface.tsx     # Per-section HTML text
├── components/
│   ├── ui/           # Mobile-first UI
│   │   ├── Navbar.tsx            # Hamburger + fullscreen menu + dot-nav
│   │   ├── AnimationSelector.tsx  # Bottom sheet animation picker
│   │   ├── JoyStick.tsx           # Virtual joystick (touch devices)
│   │   └── MiniMap.tsx            # 2D radar (desktop)
│   └── ux/           # Interaction hooks
│       ├── useClickToMove.ts      # Raycaster click-to-move
│       ├── useTouchControls.ts    # Raw touch gesture handler
│       └── useAnimationBlend.ts   # Crossfade + auto anim selector
├── App.tsx           # Root layout
├── config.ts         # Sections & animation metadata
├── main.tsx          # Entry point
└── styles.css        # Tailwind + custom styles
```

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move | Click on ground | Joystick (bottom-left) |
| Cycle animations | Click on character | Tap character |
| Pick animation | — | Bottom sheet (tap top bar) |
| Navigate sections | Scroll / dot-nav | Scroll / hamburger menu |
| Camera | Auto per section | Auto per section |

## Building

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
```

## Credits

- Architecture inspired by [wass08/r3f-portfolio-scroll-animations](https://github.com/wass08/r3f-portfolio-scroll-animations)
- GLTF animation reuse pattern from [pmndrs/examples/gltf-animations-re-used](https://github.com/pmndrs/examples/tree/main/demos/gltf-animations-re-used)
- Physics via [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier)
