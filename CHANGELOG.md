# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-10

### Added

- **3D Character System**: Mixamo GLB model loaded via `useGLTF`, cloned with `SkeletonUtils.clone` for reusability. Skinned mesh with texture mapping.
- **FBX Animation Pipeline**: Five independent animations (Idle, Walking, Running, Dancing, Jumping) loaded via `useFBX` and blended with `useAnimations`. Crossfade transitions (0.3s `fadeIn`/`fadeOut`).
- **Rapier Physics Movement**: Character wrapped in `<RigidBody>` with velocity-based click-to-move. `useFrame` syncs Three.js mesh with Rapier body position. Auto-rotation toward movement direction.
- **Scroll-Driven Sections**: Four sections (Home, About, Work, Contact) navigated by scroll via `ScrollControls` + `ScrollManager`. Camera animates between predefined positions with framer-motion springs.
- **Mobile-First UI**: Virtual joystick (touch-only), bottom-sheet animation picker, hamburger fullscreen menu, intro overlay with auto-dismiss.
- **Click-to-Move**: Raycaster intersects infinite ground plane on pointer down, converts to world-space target coordinates.
- **Auto-Animation Blend**: Character automatically switches Idle → Walking → Running based on distance to movement target.
- **Ambient 3D World**: Floating decorative shapes (DistortMaterial / WobbleMaterial) that react to section changes. Gentle ambient rotation.
- **Responsive Camera**: Separate camera positions per section. Menu open state shifts camera laterally.

### Tech Stack

- React 19 + @react-three/fiber 9.6 + @react-three/rapier 2.2
- @react-three/drei 10.7 for helpers (useGLTF, useFBX, useAnimations, ScrollControls)
- framer-motion 11 for spring animations
- Tailwind CSS 3.4 for styling
- Vite 6 + TypeScript 5.9 + bun 1.x

### Repositories referenced

- Architecture inspired by [wass08/r3f-portfolio-scroll-animations](https://github.com/wass08/r3f-portfolio-scroll-animations)
- GLTF animation reuse from [pmndrs/examples/gltf-animations-re-used](https://github.com/pmndrs/examples/tree/main/demos/gltf-animations-re-used)
- Physics via [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier)
