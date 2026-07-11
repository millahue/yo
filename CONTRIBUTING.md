# Contributing to yo

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **yo**. These are just guidelines, not rules — use your best judgment and feel free to propose changes to this document.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
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

> ⚠️ Never use `npm` or `npx`. Use `bun` and `bunx` instead. See [openagent.md](https://github.com/millahue/.opencode) for the project-wide rule.

---

## Project Structure

```
src/
├── canvas/        # 3D components inside <Canvas>
├── dom/           # HTML overlay components (outside Canvas)
├── components/
│   ├── ui/        # Mobile-first reusable UI (Navbar, Joystick, etc.)
│   └── ux/        # Interaction hooks (useClickToMove, etc.)
├── App.tsx        # Root layout
├── config.ts      # Sections + animation metadata
└── main.tsx       # Entry point
```

See [README > Architecture](README.md#architecture) for detailed data flow.

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

- Each component is a default-exported function
- Props are typed with an interface named `ComponentNameProps`
- Complex logic is extracted to custom hooks
- Three.js objects are manipulated via refs + `useFrame`, not via state

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

---

## Pull Request Process

1. **Before opening a PR**, ensure your branch is up to date with `main`.
2. Run `bun run lint && bun run build` — both must pass.
3. If your change affects the UI, include a screenshot or screen recording.
4. Fill out the PR template completely.
5. A maintainer will review your PR within a few days.
6. Address any review feedback. Once approved, it will be merged.

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
