# Autonomia Section Redesign

**Date:** 2026-03-20
**Section:** `RangeSavings` (`id="autonomia"`)
**Inspiration:** Apple Watch Ultra battery stats page

---

## Goal

Replace the current interactive StatCard grid with a clean, Apple-inspired battery showcase section. Static numbers command attention; a single CTA button surfaces the savings calculator.

---

## Layout

### Overall structure

- Dark background (`#0A0A0A`), `py-24` vertical padding, `px-6 md:px-12` horizontal padding.
- Single centered container (`max-w-7xl mx-auto`).
- Two stacked blocks: **header block** then **stats grid**.

### Header block

- Left-aligned, `max-w-xl` (~560px) so the text doesn't stretch too wide on large screens.
- Contains, top to bottom:
  1. Section heading (`h2`)
  2. Body paragraph
  3. "Calcular a minha poupança →" CTA button

### Stats grid

- Full-width `grid grid-cols-2 gap-x-8 gap-y-12 md:gap-x-16 md:gap-y-16` below the header.
- 4 cells, 2 columns × 2 rows — matches the Apple reference.
- Cells are purely display: no hover state, no cursor pointer, no click handler.

### Mobile

- Header stacks above grid.
- Grid stays `grid-cols-2` on all breakpoints (2 cols, 2 rows).

---

## Stat Cells

Each cell, top to bottom:

| Element | Style |
|---|---|
| Qualifier ("Até") | `text-sm text-text-secondary` — omit for stats that don't use "Até" |
| Number | `text-7xl md:text-8xl font-bold` in coral `#FA5C40` |
| Unit | `text-2xl md:text-3xl font-medium` in coral `#FA5C40`, inline after number |
| Descriptor | `text-sm text-text-secondary mt-2` |

### Four stats

| Qualifier | Number | Unit | Descriptor |
|---|---|---|---|
| Até | 75 | kWh | Capacidade da bateria |
| Até | 592 | km | Autonomia em ciclo WLTP |
| *(none)* | 30 | min | De 20 a 80% em carga rápida |
| *(none)* | 7,2 | km/kWh | Eficiência energética |

> **Unit conversions applied:**
> - 368 miles × 1.609 = 592 km
> - 4.5 miles/kWh × 1.609 = 7.2 km/kWh (displayed as 7,2 with Portuguese decimal comma)

---

## Header Copy

```
Uma bateria que vai onde tu vais.

O Leaf foi concebido para a tua vida real — não para um circuito de testes.
Com até 592 km de autonomia e carregamento rápido em 30 minutos,
a energia nunca te vai falhar.
```

---

## CTA Button

- Label: **"Calcular a minha poupança →"**
- Style: ghost/outlined — `border border-white/30 text-white hover:bg-white/5 transition-colors`
- Placement: left-aligned, below the body paragraph, within the header block.
- Behaviour: opens the existing `SavingsCalculator` inside the existing `Modal` component (same logic currently in `RangeSavings`).

---

## Animations

- Header block: `motion.div` fade-up on scroll (`opacity 0→1`, `y 24→0`, `duration 0.6`, `viewport once`).
- Stats grid: `motion.div` fade-up with `staggerChildren 0.1` so cells appear in sequence.
- No count-up animation on the numbers (keep it clean and static, consistent with the Apple reference).

---

## Files changed

| File | Action |
|---|---|
| `src/components/sections/RangeSavings.tsx` | Full rewrite — new layout, static stats, CTA button |
| `src/components/ui/StatCard.tsx` | No longer used by this section; leave in place (other sections may reference it) |

> The `Modal` and `SavingsCalculator` components are **unchanged** — only the trigger moves from individual card clicks to the single CTA button.

---

## What is NOT changing

- `Modal.tsx` — untouched.
- `SavingsCalculator.tsx` — untouched.
- The `id="autonomia"` anchor — kept for navbar scroll targeting.
- All other sections.
