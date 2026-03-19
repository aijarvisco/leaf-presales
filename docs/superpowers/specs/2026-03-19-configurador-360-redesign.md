# Configurador Section — 360 Viewer Redesign

**Date:** 2026-03-19
**Status:** Approved

---

## Overview

Redesign the Configurador section into a full-viewport, immersive 360° car viewer matching the quality of leaf.nissan.co.uk. The exterior view uses a canvas-based image sequence with drag-to-rotate and inertia. The interior view shows a placeholder for now, architected for a future scroll-driven image sequence.

---

## Visual Layout

- Section is full viewport height (`min-h-screen`), edge-to-edge, no padding or section title
- The 360 canvas fills the entire area; car images have scenic backgrounds baked in — no separate background layer
- UI chrome floats on top:
  - **Top-left**: `360°` badge with a ↔ drag hint icon — fades out (Framer Motion `animate={{ opacity: 0 }}`, 0.4s ease) after the user's first `pointermove` event following a `pointerdown` (i.e. first actual drag movement, not a tap)
  - **Bottom-center**: `Exterior / Interior` pill toggle (frosted glass / dark style)
  - No color swatches
- Switching views triggers a smooth opacity crossfade (0.4s, `easeInOut`) between Exterior and Interior

---

## Interaction Model

### Exterior — 360 Drag

- Supports both mouse drag and touch swipe
- Velocity tracked on every `pointermove` event in **pixels/ms** (delta pixels / delta timestamp ms)
- On pointer release: inertia loop via `requestAnimationFrame`. Each frame: `velocity *= DAMPING`, then advance `frameIndex += velocity * elapsed_ms`. Loop cancels when `|velocity| < VELOCITY_THRESHOLD`.
  - `DAMPING = 0.92` (applied per rAF frame, where `elapsed_ms` is the ms since last frame)
  - `VELOCITY_THRESHOLD = 0.005` px/ms
- Frame index wraps around for seamless 360°
- Drag sensitivity: `SENSITIVITY = 0.25` frames per pixel (i.e. drag 4px = advance 1 frame)

### Frame Mapping

- 104 images in `/public/images/360/`, named:
  - `filters-quality-60-.png` (base / frame 0)
  - `filters-quality-60- (1).png` through `filters-quality-60- (103).png`
- `FRAMES` array built at module level. Filenames with spaces and parentheses must be URL-encoded when passed to `new Image().src`. Use the pattern:
  ```ts
  const encode = (name: string) => `/images/360/${encodeURIComponent(name)}`
  const FRAMES = [
    encode('filters-quality-60-.png'),
    ...Array.from({ length: 103 }, (_, i) => encode(`filters-quality-60- (${i + 1}).png`)),
  ]
  ```
- `frameIndex` is a floating-point accumulator: `frameIndex += delta * SENSITIVITY`. Displayed frame is `((Math.round(frameIndex) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT`. The accumulator persists across drags (does not reset on `pointerdown`).

### Loading Strategy

- All 104 `Image` objects preloaded with `new Image()` (browser native, outside Next.js image pipeline) in a `useEffect` on mount
- Loading state: centered spinner (Tailwind `animate-spin` border ring, `w-8 h-8`, white, `absolute inset-0 m-auto`) shown until all 104 `onload` callbacks fire
- Frame 0 is drawn to canvas as soon as its `onload` fires so the car appears immediately

### Interior

- Single full-bleed placeholder image (crossfades in when tab switches)
- Component accepts an optional `images?: string[]` prop (unused now, ready for scroll-driven sequence)
- No drag interaction for now

---

## Component Architecture

`Configurator.tsx` (section shell) stays in `src/components/sections/`. All sub-components (`ConfiguratorViewer.tsx`, `Canvas360Viewer.tsx`, `InteriorViewer.tsx`) live in `src/components/configurator/`.

### `Configurator.tsx` — section shell (`src/components/sections/`)
- Owns `view: 'exterior' | 'interior'` state
- Owns `badgeVisible: boolean` state (initially `true`), set to `false` on first drag movement (first `pointermove` after `pointerdown`)
- Renders full-bleed `<section>`, the `360°` badge (Framer Motion `animate={{ opacity: badgeVisible ? 1 : 0 }}`, 0.4s), tab toggle overlay, and `ConfiguratorViewer`
- Passes `onFirstInteraction={() => setBadgeVisible(false)}` as a prop to `ConfiguratorViewer`
- `colorId` state and `ColorSwitcher` removed

### `ConfiguratorViewer.tsx` (`src/components/configurator/`)

Local interface (not exported to `src/types`):
```ts
interface ConfiguratorViewerProps {
  view: ConfiguratorView          // 'exterior' | 'interior'
  onFirstInteraction?: () => void
}
```

- Renders both `Canvas360Viewer` and `InteriorViewer` simultaneously using absolute positioning, toggling opacity and `pointer-events` via Framer Motion `animate` based on `view` (duration 0.4s, ease `easeInOut`)
- Passes `onFirstInteraction` to `Canvas360Viewer`
- Both views remain mounted to avoid re-preloading frames on tab switch

### `Canvas360Viewer.tsx` (`src/components/configurator/`)

Local interface:
```ts
interface Canvas360ViewerProps {
  onFirstInteraction?: () => void
}
```

- `<canvas>` element with CSS `width: 100%; height: 100%`; pixel dimensions (`canvas.width`, `canvas.height`) set via `ResizeObserver` on mount and on resize
- Frame images preloaded with `new Image()` (outside Next.js image pipeline)
- Render on-demand: `ctx.drawImage(frames[activeFrame], 0, 0, canvas.width, canvas.height)` called only when frame index changes
- `frameIndex` accumulator persists across drags (does not reset on `pointerdown`)
- `onFirstInteraction` called once on the first `pointermove` after a `pointerdown`; guarded with a `hasInteracted` ref so it fires exactly once
- Module-level constants: `SENSITIVITY = 0.25`, `DAMPING = 0.92`, `VELOCITY_THRESHOLD = 0.005`

### `InteriorViewer.tsx` (`src/components/configurator/`)

Local interface:
```ts
interface InteriorViewerProps {
  images?: string[]
}
```

- Renders `/images/nissan-leaf-lights.jpg` as a full-bleed `<img>` with `object-fit: cover; width: 100%; height: 100%`
- `images` prop accepted but unused in this phase

### Types (`src/types/index.ts`)
- `ConfiguratorMode` type deleted
- `ConfiguratorView` kept as-is
- `ConfiguratorViewerProps` does not exist in `src/types` (it was always a local interface in `ConfiguratorViewer.tsx`) — no change needed in `src/types`

### Removed files (`src/components/configurator/`)
- `ImageSequenceViewer.tsx` — replaced by `Canvas360Viewer`
- `ThreeDViewer.tsx` — not used in this phase
- `ColorSwitcher.tsx` — not needed in this phase

---

## Data

- No API calls, no server state
- `FRAMES` array generated at module level in `Canvas360Viewer.tsx`
- `NEXT_PUBLIC_CONFIGURATOR_MODE` env var removed (no longer needed)

---

## Out of Scope (this phase)

- Color variant selection
- Interior scroll-driven 360 sequence
- Auto-rotate on idle
