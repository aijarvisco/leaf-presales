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

### Behaviour
- `position: fixed`, `top-0`, `left-0`, `right-0`, `z-50`
- Uses `useState(scrolled: boolean)` + `useEffect` with a `scroll` event listener
- Toggles `scrolled` when `window.scrollY > 80`
- Cleans up the event listener on unmount

### Styling

| State | Background | Transition |
|-------|-----------|------------|
| At top (not scrolled) | `bg-transparent` | — |
| Scrolled | `bg-black` | `transition-colors duration-300` |

Both states: `h-16 px-8 md:px-16 flex items-center justify-between`

### Contents (left → right)

1. **Nissan logo** — `nissan-lettering.svg`, white (brightness-0 invert), `width=100`
2. **"Ser Contactado"** — plain `<button>` or `<span>`, white text, no border/background, scroll-to `#contacto`
3. **"Reservar"** — `<button>` with `bg-[#E8372F] text-white hover:bg-[#D42F27]`, rounded, scroll-to `#reservar`

No border on the header itself in either state.

## Colours Reference
- Coral/accent: `#E8372F` (hover: `#D42F27`) — from ClosingSection
- Sticky background: `bg-black`
- Link text: `text-white` (works on both transparent and black bg)

## What Is NOT Changing
- Hero video, animations, copy, and bottom content block — untouched
- All other page sections — untouched
- Button component — the Reservar button in the header uses inline Tailwind, not the Button component, to avoid coupling to the `primary` variant which uses `bg-accent` (blue)
