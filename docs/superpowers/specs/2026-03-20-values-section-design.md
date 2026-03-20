# Values Section — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Position:** Between AutonomiaSectionV2 and Configurator

---

## Overview

A new page section that presents four Nissan Leaf value propositions in a mixed-width horizontal carousel. Modelled visually after Apple's "Values" section — centered title block above a horizontally scrollable card row where the first card is landscape (16:9) and the remaining three are portrait (9:16), all sharing the same height.

---

## Title Block

- **Background:** white (`bg-white`)
- **Layout:** centered, `max-w-5xl mx-auto px-6`
- **Vertical spacing:** `pt-48 pb-20` (matching Highlights)

Three typographic lines, all centered:

| Element | Content | Style |
|---------|---------|-------|
| Label | `Values` | `font-normal` ~17px, color `#86868b` — same weight/color as Autonomia qualifier text |
| Title | `Designed to make a difference.` | `font-medium tracking-[-0.07em]` ~56px, color `#0A0A0A` |
| Tagline | See below | ~17px, centered, `max-w-2xl mx-auto`, color `#0A0A0A` |

**Tagline copy:** The opening phrase renders as `<strong>` inline, the rest is regular weight:

> **Our values lead the way.** Apple Vision Pro was designed to help protect your privacy and keep you in control of your data. Its built‑in accessibility features are designed to work the way you do.

---

## Carousel

### Mechanics

Identical interaction model to the existing `Highlights` component:
- Pointer drag (with pointer capture)
- Horizontal wheel scroll
- Spring-animated `x` motion value (`stiffness: 320, damping: 32, mass: 0.45`)
- Pagination dots + prev/next buttons

### Card dimensions

All cards share a fixed height. Width is derived from the aspect ratio:

| Card | Aspect ratio | Width formula | Example at 480px height |
|------|-------------|---------------|-------------------------|
| Card 0 | 16:9 | `height × 16/9` | ~854px |
| Cards 1–3 | 9:16 | `height × 9/16` | 270px |

**Height:** `480px` fixed. This keeps the section visually substantial without overflowing typical viewports.

### Offset logic

`containerLeft` matches title alignment: `Math.max((viewportWidth - 1024) / 2, 0) + 24`.

Cumulative card start positions (track-relative, with `GAP = 20`):

```
positions[0] = 0
positions[1] = wideWidth + GAP
positions[2] = wideWidth + GAP + narrowWidth + GAP
positions[3] = wideWidth + GAP + 2 × (narrowWidth + GAP)
```

`getOffset(index)`:
- `index === 0` → `containerLeft` (wide card left-aligned to container)
- `index === 1` → `containerLeft + wideWidth * 0.10 + GAP - positions[1]` (10% of wide card peeks from left)
- `index > 1` → `containerLeft + narrowWidth * 0.25 + GAP - positions[index]` (25% of prev portrait card peeks from left)

---

## Card Anatomy (`ValuesCard`)

Text is **below** the image — no overlay, no gradient. Clean separation.

```
┌────────────────────────────────┐
│                                │  ← image container
│     Next.js <Image> fill       │     rounded-2xl, overflow-hidden
│     object-cover               │     fixed height, width passed as prop
└────────────────────────────────┘
  Bold opening sentence.           ← <strong>, ~17px, font-medium, #0A0A0A
  Regular descriptive text.        ← regular weight, ~15px, #3a3a3a
  max-w matches card width
  mt-4 spacing
```

### Card data

| # | Aspect | Image | Bold opener | Regular body |
|---|--------|-------|-------------|--------------|
| 1 | 16:9 | `/images/nissan-leaf-hero.jpg` | 8 anos de garantia na bateria. | A tua tranquilidade começa aqui — cobertura total para que te focuses no essencial: conduzir. |
| 2 | 9:16 | `/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg` | Do quotidiano à escapadela. | Confortável na cidade e capaz na estrada — o Leaf adapta-se à tua vida. |
| 3 | 9:16 | `/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg` | Carrega sem complicações. | Em casa, no trabalho ou na rede pública — a carga encaixa no teu ritmo. |
| 4 | 9:16 | `/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png` | Sempre ligado, onde estiveres. | Com a app Nissan Connect tens o teu Leaf na palma da mão a qualquer momento. |

---

## Component Structure

### New files

**`src/components/ui/ValuesCard.tsx`**

```tsx
interface ValuesCardProps {
  imageSrc: string
  imageAlt: string
  boldText: string
  bodyText: string
  width: number
  height: number
}
```

Renders: image container (fixed width/height, rounded-2xl) + text block below.

**`src/components/sections/ValuesSection.tsx`**

- `'use client'`
- Imports `ValuesCard`, `useMotionValue`, `animate`, `motion`, `useEffect`, `useRef`, `useCallback`, `useState`
- Computes `wideWidth`, `narrowWidth` from `viewportWidth` and fixed height `480`
- Manages `activeIndex` and spring-animated `x`
- Renders title block + carousel track + pagination

### Modified files

**`src/app/page.tsx`** — insert `<ValuesSection />` between `<AutonomiaSectionV2 />` and `<Configurator />`

---

## Accessibility

- Prev/next buttons: `aria-label="Anterior"` / `aria-label="Próximo"`
- Pagination dots: `aria-label="Ir para valor {i + 1}"`
- `select-none touch-none` on carousel track (consistent with Highlights)
- Card images: meaningful `alt` text per card

---

## Out of scope

- Hover states on cards
- Animated entrance for the title block (can be added later)
- Mobile-specific layout changes (carousel works on all sizes)
