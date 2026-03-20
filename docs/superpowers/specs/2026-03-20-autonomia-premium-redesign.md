# Autonomia Section — Premium Redesign

**Date:** 2026-03-20
**Section:** `RangeSavings` (`id="autonomia"`)
**Builds on:** `docs/superpowers/specs/2026-03-20-autonomia-redesign-design.md`

---

## Goal

Elevate the existing Apple-inspired stats layout to a premium feel by fixing three layout/typography issues and adding a scroll-animated battery charging visual above the heading.

---

## Changes Overview

| Area | Current | New |
|---|---|---|
| Vertical padding | `py-24` | `py-32 md:py-40` |
| Horizontal padding | On `<section>` (`px-6 md:px-12`) | Moved inside container div |
| Body font size | `text-base` | `text-lg` |
| Battery icon | None | SVG circle-fill animation, scroll-driven |

---

## Layout

### Structure (top to bottom)

1. `BatteryIcon` — centered SVG with scroll-driven circle fill
2. Header block — left-aligned, `max-w-xl`
3. Stats grid — full-width 2×2

### Section element

```tsx
<section id="autonomia" className="bg-background py-32 md:py-40" ref={sectionRef}>
  <div className="max-w-7xl mx-auto px-6 md:px-12">
    ...
  </div>
</section>
```

- Padding moves from the `<section>` to the inner container div for horizontal bounds.
- `sectionRef` is a `useRef<HTMLElement>(null)` attached to the section for scroll tracking.

---

## Battery Icon Component

A local `BatteryIcon` component defined inside `RangeSavings.tsx`. Not extracted to a separate file.

### Visual specs

- **Container**: `flex justify-center mb-12`
- **SVG**: `width="80" height="80" viewBox="0 0 80 80"`
- **Track circle**: `cx="40" cy="40" r="34"`, `strokeWidth="1.5"`, `stroke="rgba(255,255,255,0.15)"`, `fill="none"`, rotated `-90deg` via `transform="rotate(-90 40 40)"`
- **Fill arc**: `<motion.circle>` — same `cx/cy/r`, `strokeWidth="1.5"`, `stroke="#FA5C40"`, `fill="none"`, `strokeLinecap="round"`, `style={{ pathLength: fillProgress, rotate: -90 }}` where `rotate` is applied via CSS transform origin
- **Lightning bolt**: `<path>` centered at `(40, 40)`, standard bolt shape, `fill="white"`, approximately 22×28px within the SVG

### Bolt path

```svg
M 43 22 L 33 42 L 40 42 L 37 58 L 47 38 L 40 38 Z
```

### Scroll binding

```tsx
const sectionRef = useRef<HTMLElement>(null)
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "center center"],
})
const fillProgress = useTransform(scrollYProgress, [0, 1], [0, 1])
```

- `scrollYProgress` goes `0→1` as the section travels from entering the bottom of the viewport to its center reaching the viewport center.
- `fillProgress` is passed directly as `pathLength` on the `<motion.circle>` — Framer Motion handles `pathLength` natively (0 = empty, 1 = full stroke).
- `useScroll` and `useTransform` are imported from `framer-motion` (already a project dependency).

---

## Typography

| Element | Current | New |
|---|---|---|
| `h2` | `text-4xl md:text-5xl` | unchanged |
| Body `<p>` | `text-base text-text-secondary` | `text-lg text-text-secondary` |
| CTA button | unchanged | unchanged |
| Stats numbers | unchanged | unchanged |

---

## Files Changed

| File | Action |
|---|---|
| `src/components/sections/RangeSavings.tsx` | Add `sectionRef`, `useScroll`/`useTransform`, `BatteryIcon` component; update padding and body font size |

No other files change.

---

## What Is NOT Changing

- Stats data, values, colors — unchanged.
- `Modal.tsx`, `SavingsCalculator.tsx` — untouched.
- `id="autonomia"` anchor — kept.
- Stats grid layout — unchanged.
- All other sections.
