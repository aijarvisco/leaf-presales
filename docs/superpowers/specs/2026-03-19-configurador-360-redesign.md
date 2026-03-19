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
  - **Top-left**: `360°` badge with a ↔ drag hint icon — fades out after the user's first drag interaction
  - **Bottom-center**: `Exterior / Interior` pill toggle (frosted glass / dark style)
  - No color swatches
- Switching views triggers a smooth `opacity` crossfade between Exterior and Interior

---

## Interaction Model

### Exterior — 360 Drag

- Supports both mouse drag and touch swipe
- Velocity tracked on every pointer move event (pixels/ms)
- On pointer release: inertia loop via `requestAnimationFrame` applies velocity with exponential decay (damping factor ~0.92) until velocity drops below a threshold
- Frame index wraps around for seamless 360°
- Drag sensitivity is a tunable constant (pixels per frame step)

### Frame Mapping

- 104 images in `/public/images/360/`, named:
  - `filters-quality-60-.png` (base / frame 0)
  - `filters-quality-60- (1).png` through `filters-quality-60- (103).png`
- Sorted numerically at build time into a static array
- Frame index derived from cumulative drag delta mapped through sensitivity constant

### Loading Strategy

- All 104 `Image` objects preloaded in JS before the canvas becomes interactive
- Loading state: subtle spinner/skeleton shown until frames are ready
- First frame drawn immediately as soon as it loads so something visible appears fast

### Interior

- Single full-bleed placeholder image (crossfades in when tab switches)
- Component accepts an optional `images` prop for future scroll-driven sequence support
- No drag interaction for now

---

## Component Architecture

### `Configurator.tsx` — section shell
- Owns `view: 'exterior' | 'interior'` state
- Renders full-bleed `<section>`, tab toggle overlay, and `ConfiguratorViewer`
- `colorId` state and `ColorSwitcher` removed (not needed in this phase)

### `ConfiguratorViewer.tsx` — view router
- Receives `view` prop
- Renders `Canvas360Viewer` for exterior, `InteriorViewer` for interior
- Owns crossfade transition (`opacity` animation) between the two views

### `Canvas360Viewer.tsx` — new component
- Self-contained: owns frame preloading, canvas rendering, drag + inertia logic
- Exposes `onFirstInteraction?: () => void` callback so parent can hide the 360 badge hint
- Uses a single `<canvas>` element; `drawImage` called inside a `requestAnimationFrame` loop
- No external state dependencies beyond being mounted

### `InteriorViewer.tsx` — new component
- Renders a full-bleed placeholder image
- Accepts optional `images?: string[]` prop (unused now, ready for scroll-driven sequence)

### Removed files
- `ImageSequenceViewer.tsx` — replaced by `Canvas360Viewer`
- `ThreeDViewer.tsx` — not used in this phase
- `ColorSwitcher.tsx` — not needed in this phase

---

## Data

- No API calls, no server state
- Frame image paths generated at module level as a static array from known naming convention
- `NEXT_PUBLIC_CONFIGURATOR_MODE` env var removed (no longer needed)

---

## Out of Scope (this phase)

- Color variant selection
- Interior scroll-driven 360 sequence
- Auto-rotate on idle
