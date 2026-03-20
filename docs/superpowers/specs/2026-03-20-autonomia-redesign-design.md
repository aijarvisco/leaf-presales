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

- Background: `bg-background` (resolves to `--color-background: #0A0A0A`), `py-24` vertical padding, `px-6 md:px-12` horizontal padding.
- Single centered container (`max-w-7xl mx-auto`).
- Two stacked blocks: **header block** then **stats grid**.

### Header block

- Left-aligned, `max-w-xl` (~560px) so the text doesn't stretch too wide on large screens.
- Contains, top to bottom:
  1. Section heading (`h2`) — the global `@layer base` in `globals.css` applies `font-family: Space Grotesk`, `font-bold`, and `tracking-tight` to all `h2` elements automatically. No extra font classes needed on the element.
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
| Number + Unit (same line) | Number: `text-7xl md:text-8xl font-bold` in coral `#FA5C40`. Unit: `text-2xl md:text-3xl font-medium` in coral `#FA5C40`, rendered inline after the number. Both wrapped in a flex row with `items-end gap-x-2` so the unit sits at the baseline of the number with a small consistent gap. |
| Descriptor | `text-sm text-text-secondary mt-2` — `text-text-secondary` maps to `--color-text-secondary: #A1A1A1`, already declared in `src/app/globals.css` under `@theme`. No new tokens needed. |

Vertical stacking order per cell: qualifier (if present) → [number + unit on same line] → descriptor.

### Four stats

All stat values are **hardcoded string literals** — no JS `number` values, no runtime formatting. This avoids locale issues and is consistent with the static, no-count-up approach.

| Qualifier | Number (string) | Unit | Descriptor |
|---|---|---|---|
| `"Até"` | `"75"` | `"kWh"` | `"Capacidade da bateria"` |
| `"Até"` | `"592"` | `"km"` | `"Autonomia em ciclo WLTP"` |
| `""` (omit) | `"30"` | `"min"` | `"De 20 a 80% em carga rápida"` |
| `""` (omit) | `"7,2"` | `"km/kWh"` | `"Eficiência energética"` |

> **Unit conversions applied:**
> - 368 miles × 1.609 = 592 km
> - 4.5 miles/kWh × 1.609 ≈ 7.2 km/kWh — rendered as `"7,2"` (Portuguese decimal comma, hardcoded string)

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
- Style: ghost/outlined — `border border-white/30 text-white hover:bg-white/5 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium`
- Placement: left-aligned, below the body paragraph, within the header block.
- State: `const [modalOpen, setModalOpen] = useState(false)`. Button sets `modalOpen` to `true`. `Modal` receives `open={modalOpen}` and `onClose={() => setModalOpen(false)}`.
- Modal children: render a wrapping `<div>` with an `<h3 className="text-2xl font-bold mb-4">A tua poupança</h3>` title, followed by `<SavingsCalculator />` — identical structure to the existing `RangeSavings` modal content.
- Imports:
  - `import Modal from '@/components/ui/Modal'` — file confirmed at `src/components/ui/Modal.tsx`. Prop interface: `open: boolean`, `onClose: () => void`, `children: React.ReactNode`.
  - `import SavingsCalculator from '@/components/forms/SavingsCalculator'` — file confirmed at `src/components/forms/SavingsCalculator.tsx`

---

## Animations

- Header block: `motion.div` with `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}`, `transition={{ duration: 0.6, ease: 'easeOut' }}`.
- Stats grid: parent is a `motion.div` with `variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}`. Each cell is a `motion.div` with `variants={itemVariants}` (no `initial`/`animate` overrides — inherits stagger from parent). Variants:
  ```ts
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }
  ```
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
