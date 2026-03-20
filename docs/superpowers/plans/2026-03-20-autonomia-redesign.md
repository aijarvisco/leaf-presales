# Autonomia Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current interactive StatCard grid in `RangeSavings.tsx` with a clean Apple-inspired static battery showcase featuring a 2×2 stat grid and a single CTA that opens the savings calculator modal.

**Architecture:** Single file rewrite of `src/components/sections/RangeSavings.tsx`. The component is split into a left-aligned header block (heading + body + CTA button) and a full-width 2×2 stat grid below. Modal state is simplified to a single boolean. No other files are touched.

**Tech Stack:** Next.js 15 (app router), TypeScript, Tailwind CSS v4, Framer Motion

---

## File Map

| File | Action |
|---|---|
| `src/components/sections/RangeSavings.tsx` | Full rewrite |
| `src/components/ui/StatCard.tsx` | Leave in place — no changes |
| `src/components/ui/Modal.tsx` | Leave in place — no changes |
| `src/components/forms/SavingsCalculator.tsx` | Leave in place — no changes |

---

## Task 1: Rewrite RangeSavings.tsx

**Files:**
- Modify: `src/components/sections/RangeSavings.tsx`

### Background: what this file currently does

The current `RangeSavings.tsx` renders 4 clickable `StatCard` components in a grid. Each card opens a different `Modal` with unique content. State is `activeModal: string | null` keyed to stat IDs.

The new version removes card interactivity entirely. Stats are static display elements. A single "Calcular a minha poupança →" button opens the savings calculator modal. State is simplified to `modalOpen: boolean`.

### Key constraints

- `bg-background` resolves to `#0A0A0A` via the `--color-background` token in `globals.css`
- `text-text-secondary` resolves to `#A1A1A1` via `--color-text-secondary` in `globals.css`
- `h2` elements automatically receive `font-family: Space Grotesk`, `font-bold`, `tracking-tight` from the global `@layer base` — do not add these classes manually
- Coral accent: `#FA5C40` — use as inline style `style={{ color: '#FA5C40' }}` or Tailwind arbitrary value `text-[#FA5C40]`
- All stat values are **hardcoded string literals**, not JS numbers

### Animation variant shape

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

- Grid parent: `motion.div` with `variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}`
- Each stat cell: `motion.div` with `variants={itemVariants}` — no `initial`/`animate` overrides, inherits stagger from parent

### Stat data

```ts
const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',     descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',    descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh', descriptor: 'Eficiência energética' },
]
```

### Steps

- [ ] **Step 1: Write the new component**

Replace the entire contents of `src/components/sections/RangeSavings.tsx` with:

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '@/components/ui/Modal'
import SavingsCalculator from '@/components/forms/SavingsCalculator'

const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',     descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',    descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh', descriptor: 'Eficiência energética' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function RangeSavings() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section id="autonomia" className="bg-background py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Header block */}
        <motion.div
          className="max-w-xl mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-5xl mb-5">
            Uma bateria que vai onde tu vais.
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            O Leaf foi concebido para a tua vida real — não para um circuito de testes.
            Com até 592 km de autonomia e carregamento rápido em 30 minutos,
            a energia nunca te vai falhar.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="border border-white/30 text-white hover:bg-white/5 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          >
            Calcular a minha poupança →
          </button>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-x-8 gap-y-12 md:gap-x-16 md:gap-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {STATS.map((stat) => (
            <motion.div key={stat.descriptor} variants={itemVariants}>
              {stat.qualifier && (
                <p className="text-sm text-text-secondary mb-1">{stat.qualifier}</p>
              )}
              <div className="flex items-end gap-x-2">
                <span className="text-7xl md:text-8xl font-bold text-[#FA5C40] leading-none">
                  {stat.number}
                </span>
                <span className="text-2xl md:text-3xl font-medium text-[#FA5C40] mb-1">
                  {stat.unit}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-2">{stat.descriptor}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div>
          <h3 className="text-2xl font-bold mb-4">A tua poupança</h3>
          <SavingsCalculator />
        </div>
      </Modal>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript compile check**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors. If errors appear, fix them before proceeding.

- [ ] **Step 3: Start dev server and verify visually**

Run:
```bash
npm run dev
```

Open `http://localhost:3000` and scroll to the `#autonomia` section. Verify:
- [ ] Dark background, left-aligned heading and body text with `max-w-xl` constraint
- [ ] "Calcular a minha poupança →" ghost button is visible and left-aligned
- [ ] 2×2 stat grid shows all 4 stats with coral numbers and muted descriptors
- [ ] "Até" qualifier appears above 75kWh and 592km cells; absent for 30min and 7,2km/kWh
- [ ] Number and unit are on the same line with unit sitting at baseline
- [ ] Clicking the button opens the savings calculator modal
- [ ] Modal closes on backdrop click, ✕ button, and Escape key
- [ ] On mobile (resize to <768px), layout stays 2 columns

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/RangeSavings.tsx
git commit -m "feat: redesign autonomia section — Apple-style static battery stats"
```
