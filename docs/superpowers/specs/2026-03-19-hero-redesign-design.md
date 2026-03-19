# Hero Section Redesign — Design Spec

**Date:** 2026-03-19
**Status:** Approved

---

## Context

The current hero is a full-screen video with a flat 50% black overlay and centered text in a single typeface (Geist Sans bold). The copy, layout, overlay, and animation all read as generic. The goal is to make the hero feel aspirational and electric — referencing the campaign's moon/space visual language: otherworldly, quietly ambitious, cinematic.

---

## Personality

**Aspirational electric.** The register sits between premium automotive (Genesis, BMW) and editorial luxury. Cold confidence, not loudness. The moon in the campaign imagery signals "out of this world" — the design should feel like the video is a window into a different place, and the text grounds the viewer just enough to act.

---

## Typography System

### Fonts

| Role | Font | Weight | Style |
|------|------|--------|-------|
| Headline | Cormorant Garamond | 300 (Light) | Italic for line 1, Roman for line 2 |
| All other text | Geist Sans (existing) | 300–400 | Normal |

Load Cormorant Garamond via `next/font/google` with this exact config:

```ts
import { Cormorant_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  weight: ['300'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})
```

Apply `cormorant.variable` to the `<html>` element (alongside the existing Geist variable). Add to `globals.css` `@theme`:

```css
@theme {
  --font-family-cormorant: var(--font-cormorant), Georgia, serif;
}
```

This exposes a `font-cormorant` utility class via Tailwind v4.

### The Typographic Hook

The headline is two separate lines with **italic/roman contrast** — same font, same weight, opposite posture:

- **Line 1** — `"Além do"` — Cormorant Light **italic** (`font-cormorant italic`)
- **Line 2** — `"Horizonte."` — Cormorant Light roman (`font-cormorant not-italic`)

Line 1 is softer, almost a whisper. Line 2 is definitive, lands like a full stop.

### Size Scale

| Element | Mobile | md | lg |
|---------|--------|----|----|
| Headline | `text-6xl` | `text-7xl` | `text-[9rem]` |
| Label | `text-xs` | `text-xs` | `text-sm` |
| Subline | `text-base` | `text-lg` | `text-lg` |

### Width Constraints

- **Headline**: unconstrained — let the large type breathe across the frame
- **Subline + CTAs**: `max-w-md` — keeps line length comfortable without competing with the headline

---

## Copy

```
NISSAN LEAF · 100% ELÉTRICO · RESERVA ANTECIPADA
────────────────
Além do          ← line 1: Cormorant Light italic
Horizonte.       ← line 2: Cormorant Light roman

O Nissan Leaf foi construído para quem nunca parou de imaginar.

[Reservar agora]   [Saber mais]
```

**Label** — all-caps, Geist Sans 300, `tracking-[0.2em]`, `text-white/50`
**Rule** — `1px` solid, `border-white/30`, `w-12`
**Subline** — Geist Sans 300, `text-white/70`
**CTA 1** — existing `<Button variant="primary">` component
**CTA 2** — existing `<Button variant="ghost">` component (text changes from "Ser contactado" to "Saber mais")

---

## Layout & Composition

- **Alignment**: Left-anchored. `absolute bottom-16 md:bottom-20`, `pl-8 md:pl-16 lg:pl-24`
- **Scroll indicator**: Removed (the scroll-driven overlay animation communicates "keep going")
- **Mobile**: Headline at `text-6xl`, layout remains bottom-left

**Text block DOM order** (top to bottom):
1. Label (`NISSAN LEAF · ...`)
2. Thin rule (`<div>` or `<hr>`, `w-12 border-t border-white/30 my-4`)
3. Headline (two `<span>` elements, each on its own line, inside a `<h1>`)
4. Subline (`<p>`, `mt-4 max-w-md`)
5. CTAs (`<div>`, `mt-8 flex gap-4`)

---

## Overlay System

Three `absolute inset-0` `<div>` layers stacked above the video. **No flat black overlay.**

### Layer 1 — Top vignette
```css
background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%);
```
Barely visible. Gives the sky a cinematic coolness without dimming the moon.

### Layer 2 — Bottom-to-solid gradient
```css
background: linear-gradient(to bottom, transparent 40%, #0A0A0A 100%);
```
This is a `motion.div`. Its opacity is animated on scroll (see Scroll Behavior). Creates natural darkness for the text block and makes the bottom edge of the hero already be the background of the next section — no perceived cut.

### Layer 3 — Left edge vignette
```css
background: linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%);
```
Ensures text contrast without darkening the right side. The right half of the video stays luminous.

---

## Animation Sequence

Entry animations via Framer Motion. Elements reveal sequentially — not all doing the same fade-up.

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Label | `opacity: 0 → 1`, no movement | 0.6s | 0s |
| Rule | `scaleX: 0 → 1`, `transformOrigin: "left center"` | 0.5s | 0.15s |
| Headline line 1 ("Além do") | Clip-path upward reveal + fade | 0.7s | 0.3s |
| Headline line 2 ("Horizonte.") | Clip-path upward reveal + fade | 0.7s | 0.45s |
| Subline | `opacity: 0 → 1`, `y: 16 → 0` | 0.6s | 0.7s |
| CTAs | `opacity: 0 → 1`, `y: 16 → 0` | 0.6s | 0.9s |

**Headline clip-path reveal** — text is revealed upward (bottom edge opens first, text rises into place):

```ts
initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
```

Each headline line should be wrapped in an `overflow-hidden` container so the clipped text does not affect surrounding layout.

**`prefers-reduced-motion` fallback**: wrap all entry animations in a check. When reduced motion is preferred, show all elements at full opacity with no transform — no delays, no movement.

```ts
const prefersReducedMotion = useReducedMotion() // Framer Motion hook
// If true: skip initial/animate props, render fully visible
```

---

## Scroll Behavior

Implemented with `useScroll` and `useTransform` from Framer Motion.

```ts
const heroRef = useRef<HTMLElement>(null)
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ['start start', 'end start'], // 0 = top of hero aligned to top of viewport, 1 = bottom of hero at top of viewport
})
```

Three parallel effects:

### 1. Bottom gradient darkens
The Layer 2 `motion.div` animates its opacity from 0.7 to 1, making the darkness intensify:
```ts
const gradientOpacity = useTransform(scrollYProgress, [0, 0.6], [0.7, 1])
// style={{ opacity: gradientOpacity }}
```
Effect: the bottom half of the video progressively darkens, "swallowing" the scene from below. Opacity stays within [0, 1].

### 2. Text block recedes
The **entire left-anchored content block** (the outermost `motion.div` containing label, rule, headline, subline, and CTAs) receives these scroll-driven bindings:
```ts
const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
const textY = useTransform(scrollYProgress, [0, 0.4], [0, -24])
// style={{ opacity: textOpacity, y: textY }}
```

### 3. Video Ken Burns
The `<video>` element is wrapped in a `motion.div` with `overflow-hidden` and the scale binding:
```ts
const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])
// style={{ scale: videoScale }} on the motion.div wrapper
```
The moon drifts slowly upward as the page scrolls down.

---

## Video & Fallback

- **Video source**: `/videos/lhd_h.mp4` (existing asset)
- **Attributes**: `autoPlay muted loop playsInline` (unchanged)
- **Poster image**: `/images/nissan-leaf-hero.jpg` — add as `poster` attribute on the `<video>` element. Displayed while the video loads or if autoplay is blocked.

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/sections/Hero.tsx` | Full rewrite: layout, overlay (3 layers), copy, animation, scroll behavior |
| `src/app/layout.tsx` | Add `Cormorant_Garamond` font via `next/font/google`, apply `.variable` to `<html>` |
| `src/app/globals.css` | Add `--font-family-cormorant: var(--font-cormorant), Georgia, serif` to `@theme` |
