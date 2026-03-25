# DesignIntroSection — Design Spec

**Date:** 2026-03-25
**Status:** Approved

---

## Overview

A full-viewport-height section placed between `Highlights` and `AutonomiaSectionV2` in `page.tsx`. It serves as a chapter-divider that introduces the design-focused portion of the page. A label and title appear first, then the top-view car image slides in from the right and comes to rest centered, covering the text.

---

## Placement

`page.tsx` order:
```
<Highlights />
<DesignIntroSection />   ← new
<AutonomiaSectionV2 />
```

---

## Component

**File:** `src/components/sections/DesignIntroSection.tsx`
**Directive:** `'use client'`
**Dependencies:** `framer-motion` (already installed)

---

## Layout

- Section: `min-h-screen`, `bg-[#D5D9DF]`, `overflow-hidden`, `relative`
- Text block: absolutely centered via `inset-0 flex items-center justify-center flex-col text-center`
- Car image: absolutely positioned, centered with `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`

**Layer order (DOM, bottom → top):**
1. Text block (renders first)
2. Car image (renders on top, no z-index needed)

---

## Text Content

| Element | Value |
|---------|-------|
| Label   | `Design` |
| Title   | `Uma forma que fala por si.` |

**Label style:** `font-semibold text-sm tracking-widest uppercase text-[#0A0A0A]/60`
**Title style:** `text-[56px] font-medium tracking-[-0.07em] leading-tight text-[#0A0A0A]` (matches existing section headings)

---

## Animation

### Phase 1 — Text enters (on viewport entry)

Both elements use `whileInView` with `viewport={{ once: true }}`:

| Element | initial | animate | transition |
|---------|---------|---------|------------|
| Label   | `opacity: 0, y: 16` | `opacity: 1, y: 0` | `duration: 0.4s, ease: easeOut` |
| Title   | `opacity: 0, y: 16` | `opacity: 1, y: 0` | `duration: 0.4s, delay: 0.1s, ease: easeOut` |

### Phase 2 — Car slides in

Uses `whileInView` with `viewport={{ once: true }}`:

| Property | Value |
|----------|-------|
| initial x | `"110vw"` |
| animate x | `0` |
| transition type | `spring` |
| stiffness | `60` |
| damping | `20` |
| mass | `1` |
| delay | `0.5s` |

The car enters from off the right edge and comes to rest fully centered. No opacity transition — it just drives in.

---

## Car Image

- **Source:** `/images/leaf-top-view.png`
- **Alt:** `Nissan Leaf — vista de cima`
- **Sizing:** `w-screen min-w-[900px]` — wide enough to fully occlude the text when centered
- **Rendered with:** Next.js `<Image>` with `unoptimized` or appropriate `width`/`height` props; `priority={false}`

---

## Accessibility

- Section has `id="design-intro"` for potential anchor linking
- Car image has descriptive `alt` text
- Text remains in the DOM (not removed), just visually covered by the car

---

## Out of scope

- No subtitle or body copy below the title
- No CTA button or link
- No mobile-specific alternative layout (same animation on all screen sizes)
- No scroll-linked / sticky behavior
