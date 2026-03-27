# Hero Header Redesign

**Date:** 2026-03-27
**Status:** Approved

## Overview

Replace the current fixed-height dark `SiteHeader` (which pushes the Hero down) with a new overlay header that sits transparently on top of the full-viewport Hero, then transitions to a solid black sticky header as the user scrolls.

## Goals

- Hero becomes truly full-viewport (100vh), no space consumed by header above it
- Header overlays the hero transparently at page load
- After scrolling ~80px, header becomes sticky with a black background (matching the site's dark aesthetic)
- Navigation items remain readable in both states (all white/coral on transparent and black backgrounds)

## Layout Changes

### `page.tsx`
- Remove the `h-screen flex-col` wrapper div that currently groups `SiteHeader` and `Hero`
- `SiteHeader` and `Hero` become siblings in `<main>` — header is fixed/overlay, Hero fills the viewport independently

### `Hero.tsx`
- Change `className` from `relative flex-1 overflow-hidden` to `relative h-screen overflow-hidden`
- No padding-top needed; the fixed header floats above

## New `SiteHeader` Component

### Client Component
- Must include `'use client'` directive — uses `useState` and `useEffect`

### Behaviour
- `position: fixed`, `top-0`, `left-0`, `right-0`, `z-50`
- `scrolled` state initialised to `false`; the scroll listener is attached only inside `useEffect` (avoids SSR/`window` access and hydration mismatch)
- Toggles `scrolled` to `true` when `window.scrollY > 80`, back to `false` when at or below 80
- Cleans up the event listener on unmount

### Styling

The `transition-colors duration-300` class is **always present** on the header element (not conditionally added), so the transition animates in both directions (transparent → black and black → transparent).

| State | Background |
|-------|-----------|
| At top (`scrolled = false`) | `bg-transparent` |
| Scrolled (`scrolled = true`) | `bg-black` |

Base classes (always applied): `fixed top-0 left-0 right-0 z-50 h-16 px-8 md:px-16 flex items-center justify-between transition-colors duration-300 motion-reduce:transition-none`

The `motion-reduce:transition-none` class disables the background transition for users with `prefers-reduced-motion: reduce`, as a safe fallback regardless of whether Tailwind preflight is active.

No `backdrop-blur` — keeping the hero video fully crisp behind the transparent header.
No border in either state.

### Contents (left → right)

1. **Nissan logo** — `nissan-lettering.svg`, white (`brightness-0 invert`), `width={100} height={14}` with `style={{ height: 'auto' }}` to let the browser preserve the SVG's intrinsic aspect ratio (viewBox `0 0 298 42.17`, ~7.07:1). The `height={14}` satisfies Next.js `<Image>`'s required prop; `style={{ height: 'auto' }}` overrides it at render time. Intentionally slightly smaller than the old `h-24` header's `width={120}`, proportional to the slimmer `h-16` height.
2. **"Ser Contactado"** — `<button>` (keyboard-accessible), `text-white text-sm font-normal`, no border/background, `onClick` scrolls to `#contacto`
3. **"Reservar"** — `<button>`, `bg-[#E8372F] text-white hover:bg-[#D42F27] px-5 py-2 rounded-lg text-sm font-normal transition-colors duration-200`, `onClick` scrolls to `#reservar`

### Mobile
Both "Ser Contactado" and "Reservar" remain visible at all viewport sizes — no collapse/hamburger needed for two items. The `gap-4 flex items-center` wrapper keeps them comfortably spaced on small screens.

### Reduced Motion
The background transition is a CSS `transition-colors` (not a JS-driven animation), so it automatically respects `prefers-reduced-motion: reduce` via the browser's native behaviour. No additional handling required.

## Colours Reference
- Coral/accent: `#E8372F` (hover: `#D42F27`) — matches ClosingSection "Reservar Agora" button
- Sticky background: `bg-black`
- All text/logo: `text-white` / `brightness-0 invert` (works on both transparent and black bg)

## What Is NOT Changing
- Hero video, animations, copy, and bottom content block — untouched
- All other page sections — untouched
- Button component — the header buttons use inline Tailwind, not the shared `Button` component, to avoid coupling to `primary` variant (which is blue, not coral)
