# Values Section — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Position:** Between AutonomiaSectionV2 and Configurator (`id="values"`)

---

## Overview

A new page section that presents four Nissan Leaf value propositions in a mixed-width horizontal carousel. Modelled visually after Apple's "Values" section — centered title block above a horizontally scrollable card row where the first card is landscape (16:9) and the remaining three are portrait (9:16), all sharing the same height.

---

## Title Block

- **Background:** white (`bg-white`)
- **Layout:** centered, `max-w-5xl mx-auto px-6`
- **Vertical spacing:** `pt-48 pb-20`

Three typographic lines, all centered:

| Element | Content | Style |
|---------|---------|-------|
| Label | `Values` | `font-normal` ~17px, color `#86868b` — same as Autonomia qualifier text |
| Title | `Designed to make a difference.` | `font-medium tracking-[-0.07em]` ~56px, color `#0A0A0A` |
| Tagline | See below | ~17px, centered, `max-w-2xl mx-auto`, color `#0A0A0A` |

**Tagline copy** _(working copy — to be adapted to Nissan Leaf context before launch)_: The opening phrase renders as `<strong>` inline, the rest is regular weight:

> **Our values lead the way.** Apple Vision Pro was designed to help protect your privacy and keep you in control of your data. Its built‑in accessibility features are designed to work the way you do.

---

## Card Dimensions (constants — not viewport-dependent)

Card height is fixed. Width follows directly from each aspect ratio. These are computed once as module-level constants:

```ts
const CARD_HEIGHT  = 480                             // px, fixed
const WIDE_WIDTH   = Math.round(CARD_HEIGHT * 16 / 9) // 853px
const NARROW_WIDTH = Math.round(CARD_HEIGHT * 9 / 16)  // 270px
const GAP          = 20                              // px, gap between cards
```

| Card | Aspect | Width | Height |
|------|--------|-------|--------|
| Card 0 | 16:9 | 853px | 480px |
| Cards 1–3 | 9:16 | 270px | 480px |

---

## Carousel

### Mechanics

Identical interaction model to the existing `Highlights` component:
- Pointer drag (with pointer capture)
- Horizontal wheel scroll
- Spring-animated `x` motion value (`stiffness: 320, damping: 32, mass: 0.45`)
- Pagination dots + prev/next buttons

### Viewport dependency and hydration guard

The only value that depends on `viewportWidth` is `containerLeft`. Initialise `viewportWidth` to `0` in state (same as Highlights) and set it inside `useEffect`. When `viewportWidth === 0`, card widths and heights are still valid constants — only the initial carousel alignment is deferred.

```ts
const containerLeft = viewportWidth > 0
  ? Math.max((viewportWidth - 1024) / 2, 0) + 24
  : 0
```

### Card positions in the track (track-relative, px)

```
pos[0] = 0
pos[1] = WIDE_WIDTH + GAP                                         // 873
pos[2] = WIDE_WIDTH + GAP + NARROW_WIDTH + GAP                    // 1163
pos[3] = WIDE_WIDTH + GAP + (NARROW_WIDTH + GAP) * 2             // 1453
```

Closed form for `i >= 1`: `pos[i] = WIDE_WIDTH + GAP + (i - 1) * (NARROW_WIDTH + GAP)`

### `getOffset(index)` — track x value to snap to each index

```ts
function getOffset(index: number): number {
  if (index === 0) {
    // Align wide card to containerLeft
    return containerLeft
  }
  if (index === 1) {
    // Desired: card 1 appears at WIDE_WIDTH * 0.10 + GAP from viewport left (= 105px)
    // offset = desired_left - pos[1] = (WIDE_WIDTH * 0.10 + GAP) - (WIDE_WIDTH + GAP)
    //        = WIDE_WIDTH * 0.10 - WIDE_WIDTH  ≈ −768
    return WIDE_WIDTH * 0.10 - WIDE_WIDTH
  }
  // index 2, 3: card appears at NARROW_WIDTH * 0.25 + GAP from viewport left (= 87.5px)
  // This means 25% of the previous portrait card is visible as a peek (67.5px),
  // plus the GAP (20px) before the active card. Both are visible.
  // offset = (NARROW_WIDTH * 0.25 + GAP) - pos[index]
  //        = NARROW_WIDTH * 0.25 + GAP - (WIDE_WIDTH + GAP + (index - 1) * (NARROW_WIDTH + GAP))
  //        = NARROW_WIDTH * 0.25 - WIDE_WIDTH - (index - 1) * (NARROW_WIDTH + GAP)
  // index 2 ≈ −1075,  index 3 ≈ −1365
  return NARROW_WIDTH * 0.25 - (WIDE_WIDTH + (index - 1) * (NARROW_WIDTH + GAP))
}
```

Numerical verification (constants: WIDE=853, NARROW=270, GAP=20):

| index | formula result | viewport-left position of active card |
|-------|---------------|--------------------------------------|
| 0 | `containerLeft` (e.g. 184 at 1440px vw) | card 0 at 184px from left |
| 1 | −768 | card 1 at −768 + 873 = **105px** from left (≈ 10% of 853 + GAP) |
| 2 | −1075 | card 2 at −1075 + 1163 = **88px** from left (≈ 25% of 270 + GAP) |
| 3 | −1365 | card 3 at −1365 + 1453 = **88px** from left (≈ 25% of 270 + GAP) ✓ |

### Drag commit threshold

Use the same two-path logic as `Highlights`:
1. **Velocity path:** if `|velocity| > 300 px/s`, commit in the velocity direction
2. **Distance path:** if `|delta| > NARROW_WIDTH / 4` (≈ 68px), commit in the drag direction

`NARROW_WIDTH / 4` applies to all index transitions (avoids an unexpectedly large threshold from the wide card).

---

## Card Anatomy (`ValuesCard`)

Text is **below** the image — no overlay, no gradient.

```
┌─────────────────────────────┐
│                             │  ← wrapper div: position relative, overflow hidden
│    Next.js <Image> fill     │    rounded-2xl
│    object-cover             │    style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
└─────────────────────────────┘
  Bold opening sentence.        ← <strong> inline, ~17px, #0A0A0A
  Regular descriptive text.     ← regular weight, ~15px, #3a3a3a
  mt-4, max-w matches card width
```

`ValuesCard` uses `<Image fill>`. The wrapper div must have `position: relative` and explicit pixel dimensions via `style={{ width, height }}` so that `fill` can resolve. The `width` and `height` numbers are passed as props and applied to the wrapper — `<Image>` itself receives only `fill`, `src`, `alt`, and `className`.

### Props interface

```tsx
interface ValuesCardProps {
  imageSrc: string
  imageAlt: string
  boldText: string
  bodyText: string
  width: number   // applied to wrapper div style, not to <Image>
  height: number  // applied to wrapper div style, not to <Image>
}
```

### Card data (0-based indices, matching code)

| index | Aspect | Width | Image | Bold opener | Regular body |
|-------|--------|-------|-------|-------------|--------------|
| 0 | 16:9 | 853px | `/images/nissan-leaf-hero.jpg` | 8 anos de garantia na bateria. | A tua tranquilidade começa aqui — cobertura total para que te focuses no essencial: conduzir. |
| 1 | 9:16 | 270px | `/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg` | Do quotidiano à escapadela. | Confortável na cidade e capaz na estrada — o Leaf adapta-se à tua vida. |
| 2 | 9:16 | 270px | `/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg` | Carrega sem complicações. | Em casa, no trabalho ou na rede pública — a carga encaixa no teu ritmo. |
| 3 | 9:16 | 270px | `/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png` | Sempre ligado, onde estiveres. | Com a app Nissan Connect tens o teu Leaf na palma da mão a qualquer momento. |

---

## Component Structure

### New files

**`src/components/ui/ValuesCard.tsx`**
- Stateless, pure presentational
- Wrapper div: `relative rounded-2xl overflow-hidden select-none` with `style={{ width, height }}`
- `<Image fill className="object-cover pointer-events-none" draggable={false} />`
- Bold text: Tailwind `text-[17px] font-medium text-[#0A0A0A]`
- Body text: Tailwind `text-[15px] font-normal text-[#3a3a3a]`
- Text block: `mt-4` below wrapper, `max-w` matching card width

**`src/components/sections/ValuesSection.tsx`**
- Section outer padding: `pt-48 pb-48 bg-white overflow-hidden` (matching `Highlights` section)
- `'use client'`
- Constants (`CARD_HEIGHT`, `WIDE_WIDTH`, `NARROW_WIDTH`, `GAP`) at module level
- `VALUES` data array at module level
- State: `activeIndex`, `viewportWidth`
- Pointer drag handlers, wheel handler — same pattern as `Highlights`
- `getOffset` uses the formulas above
- Renders: title block + carousel track + pagination

### Modified files

**`src/app/page.tsx`** — insert `<ValuesSection />` between `<AutonomiaSectionV2 />` and `<Configurator />`.

---

## Accessibility

- Section element: `id="values"`
- Prev/next buttons: `aria-label="Anterior"` / `aria-label="Próximo"`
- Pagination dots: `aria-label={`Ir para valor ${i + 1}`}`
- `select-none touch-none` on carousel track
- Card images: meaningful `alt` text per card (see card data table)

---

## Out of scope

- Hover states on cards
- Animated entrance for the title block
- Mobile-specific layout changes (carousel works on all sizes)
- Finalising tagline copy (to be done before launch)
