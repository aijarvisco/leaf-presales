# Autonomia Section V2 — Design Spec

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Replace the current `RangeSavings` section with a new full-screen, scroll-driven `AutonomiaSectionV2` component. The existing `RangeSavings` component is hidden (not deleted) in `page.tsx`. The new section communicates battery range through a cinematic scroll animation: a pinned full-screen image with copy that travels upward as the user scrolls, revealing the four battery stats at the bottom.

---

## Section Structure

- **Outer wrapper**: `<section>` with `height: 300vh` — provides the scroll distance that drives all animations. Has `id="autonomia"` for anchor linking.
- **Sticky shell**: `position: sticky; top: 0; height: 100vh; overflow: hidden` — locks the visual to the viewport while the user scrolls through the 300vh container.
- **Background layer**: `next/image` of `889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg`, `fill`, `object-cover`, `z-0`.
- **Overlay**: `bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75` — identical to `ClosingSection` for visual continuity.

---

## Scroll Animation

Uses Framer Motion `useScroll` targeting the outer 300vh wrapper with `offset: ['start start', 'end end']`.

### Copy travel
- `copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])`
- Copy starts vertically centered (~40vh from top), travels upward, settles near the top of the viewport (~5vh) at the 50% scroll point.
- Implemented as `<motion.div style={{ y: copyY }}>` — absolutely positioned, horizontally centered.

### Stats reveal
- `statsOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])`
- Stats panel fades in as copy finishes its travel.
- Individual columns stagger left-to-right using Framer Motion `variants` with `staggerChildren: 0.12`.
- Stagger trigger: `useMotionValueEvent` on `statsOpacity` — when it crosses `0.05`, set a boolean state that switches the stats container from `initial` to `animate`.

---

## Copy Block

Absolutely positioned, horizontally centered within the sticky shell.

| Element | Value |
|---------|-------|
| Label text | "Autonomia" |
| Label size | `24px` |
| Label weight | `font-normal` |
| Label colour | `#86868b` |
| Title text | "Uma bateria que vai onde tu vais." |
| Title size | `80px` |
| Title line-height | `1.07` |
| Title weight | `font-semibold` |
| Title colour | `white` |
| Title tracking | `-0.005em` |
| Gap label → title | `12px` (`mb-3`) |
| Alignment | `text-center` |

---

## Stats Panel

Absolutely positioned at `bottom-12`, full width, horizontally centered. Four columns in a `grid grid-cols-4` layout, overlaid on the background image.

### Data

| Col | Qualifier | Number | Unit | Descriptor |
|-----|-----------|--------|------|------------|
| 1 | Até | 75 | kWh | Capacidade da bateria |
| 2 | Até | 592 | km | Autonomia em ciclo WLTP |
| 3 | — | 30 | min | De 20 a 80% em carga rápida |
| 4 | — | 7,2 | km/kWh | Eficiência energética |

### Typography

| Element | Value |
|---------|-------|
| Qualifier | `21px`, `font-normal`, `#86868b` |
| Number | `48px`, `font-medium`, `white`, `tracking-[-0.003em]` |
| Unit | `48px`, `font-medium`, `white`, `tracking-[-0.003em]` (same row as number) |
| Descriptor | `21px`, `font-normal`, `#86868b` |

Number and unit sit on the same baseline row. Qualifier (when present) sits above. Descriptor sits below.

---

## Component File

**New file:** `src/components/sections/AutonomiaSectionV2.tsx`

### Dependencies
- `framer-motion`: `useScroll`, `useTransform`, `useMotionValueEvent`, `motion`, `AnimatePresence`
- `next/image`: background image
- No new packages required

### page.tsx changes
```tsx
// Hide existing:
{false && <RangeSavings />}

// Add new (in same position):
<AutonomiaSectionV2 />
```

---

## Visual Reference

Reference style: Apple Vision Pro product page — small neutral label above a large commanding white title, centered on a dark full-bleed image. Stats sit quietly at the bottom as supporting data, not competing with the headline.

---

## Out of Scope

- The "Calcular a minha poupança" modal/button from `RangeSavings` — not included in V2.
- Mobile responsive breakpoints — design targets desktop; mobile adaptation is a follow-up.
- The `id="autonomia"` anchor is preserved for navbar linking.
