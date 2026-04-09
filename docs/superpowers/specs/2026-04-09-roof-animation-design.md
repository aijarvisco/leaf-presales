# Roof Animation Section — Design Spec

**Date:** 2026-04-09  
**Branch:** copy/2026-04-09-copy-update  
**Status:** Approved

---

## Overview

A new full-viewport scroll-driven section that animates the opening of the Nissan LEAF's panoramic roof through a 250-frame image sequence. As the user scrolls, each frame is rendered to a `<canvas>` element. When the animation nears completion, a dark gradient overlay fades in from the bottom with a title and paragraph. The section is inserted in `src/app/page.tsx` immediately after `<DesignIntroSection />`.

---

## Assets

- **Location:** `public/images/roof/`
- **Format:** WebP (confirm actual file extension in `public/images/roof/` before building frame URL array — current files may still be `.png` pending conversion)
- **Count:** 250 frames
- **Naming:** `25tdieulhd_pz1d_u_roof_h_00000.webp` → `25tdieulhd_pz1d_u_roof_h_00249.webp`
- **Source dimensions:** 2500×1280 px

Frame URL helper:
```ts
const pad = (n: number) => String(n).padStart(5, '0')
const FRAMES = Array.from({ length: 250 }, (_, i) =>
  `/images/roof/25tdieulhd_pz1d_u_roof_h_${pad(i)}.webp`
)
```

---

## Component

**File:** `src/components/sections/RoofAnimationSection.tsx`  
**Directive:** `'use client'`  
**Dependencies:** React (`useRef`, `useEffect`, `useState`), framer-motion (`useScroll`, `useTransform`, `motion`), Next.js `Image` (for the eager frame-0 fallback).

---

## Section Structure

```
<section id="roof-animation" style={{ height: '400vh' }}>
  <div class="sticky top-0 h-screen overflow-hidden bg-black">
    <!-- Frame 0 static fallback (eager, shown while batch 1 loads) -->
    <Image src={FRAMES[0]} fill priority ... />

    <!-- Canvas (covers fallback once ready) -->
    <canvas ref={canvasRef} class="absolute inset-0 w-full h-full" />

    <!-- Loading spinner (hidden once batch 1 ready) -->
    {!batchOneReady && <Spinner />}

    <!-- Bottom overlay (opacity driven by scrollYProgress) -->
    <motion.div style={{ opacity: overlayOpacity }}
      class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)"
    >
      <div class="absolute bottom-12 left-12 max-w-sm">
        <h2>Interior de uma nova era</h2>
        <p>O Teto panorâmico escurecido oferece uma experiência de habitáculo premium com maior altura livre e um isolamento térmico eficiente.</p>
      </div>
    </motion.div>
  </div>
</section>
```

---

## Scroll Behaviour

- `useScroll` targets the `<section>` element with `offset: ['start start', 'end end']`
- `scrollYProgress` (0 → 1) maps to frame index: `Math.round(scrollYProgress * 249)`
- Section height: `400vh` — gives ~4 viewport-heights of travel across 250 frames

---

## Canvas Rendering

Reuses the `object-cover` draw logic from `Canvas360Viewer`:

```ts
const scale = Math.max(canvasW / imgW, canvasH / imgH)
const sw = imgW * scale
const sh = imgH * scale
const sx = (canvasW - sw) / 2
const sy = (canvasH - sh) / 2
ctx.drawImage(img, sx, sy, sw, sh)
```

A `ResizeObserver` keeps canvas pixel dimensions in sync with its CSS size and redraws the current frame on resize.

Frame drawing fires inside a `useEffect` on `scrollYProgress` change (via `scrollYProgress.on('change', ...)`) — no React re-render per frame.

---

## Preloading Strategy

250 frames split into 5 batches of 50:

| Batch | Frames | Triggered |
|-------|--------|-----------|
| 1 | 0–49 | On mount (immediately) |
| 2 | 50–99 | After batch 1 completes |
| 3 | 100–149 | After batch 2 completes |
| 4 | 150–199 | After batch 3 completes |
| 5 | 200–249 | After batch 4 completes |

State: `batchOneReady: boolean` — set true when all 50 images in batch 1 have `onload` fired. Controls spinner visibility and canvas visibility.

Fallback: if the user scrolls to a frame not yet loaded, the canvas holds the last successfully drawn frame (no blank, no error).

---

## Overlay Animation

Driven by `useTransform` — no scroll listener needed:

```ts
const overlayOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1])
```

- Gradient: `linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)`
- Text block: `absolute bottom-12 left-12` (desktop), `bottom-8 left-6` (mobile, via Tailwind responsive prefix)
- Typography follows existing site conventions (tracking, weight, color)
- Overlay remains fully opaque once progress reaches 1.0 (end of section)

---

## Copy

| Element | Text |
|---------|------|
| `<h2>` | Interior de uma nova era |
| `<p>` | O Teto panorâmico escurecido oferece uma experiência de habitáculo premium com maior altura livre e um isolamento térmico eficiente. |

---

## Page Integration

In `src/app/page.tsx`, after `<DesignIntroSection />`:

```tsx
import RoofAnimationSection from '@/components/sections/RoofAnimationSection'
// ...
<DesignIntroSection />
<RoofAnimationSection />
<ValuesSection id="interior-highlights" ... />
```

---

## Out of Scope

- CTAs inside the overlay
- Mobile-specific reduced frame count (all 250 frames on all devices)
- Any video fallback path
