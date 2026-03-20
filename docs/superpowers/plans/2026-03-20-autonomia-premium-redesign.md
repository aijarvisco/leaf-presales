# Autonomia Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the `RangeSavings` section with a scroll-animated SVG battery icon, more breathing room, and tighter typography balance.

**Architecture:** Single file rewrite of `src/components/sections/RangeSavings.tsx`. Add a local `BatteryIcon` sub-component that receives a Framer Motion `MotionValue<number>` as `pathLength` and renders an 80px SVG circle fill animation. The parent binds `useScroll` to the section ref and passes `scrollYProgress` directly to `BatteryIcon`.

**Tech Stack:** Next.js, React 19, Framer Motion (already installed), Tailwind CSS v4, Jest + Testing Library (jsdom)

---

## File Map

| File | Action |
|---|---|
| `src/components/sections/RangeSavings.tsx` | Full rewrite — add BatteryIcon, sectionRef, useScroll, padding/typography fixes |
| `tests/RangeSavings.test.tsx` | New — render smoke test verifying key markup |

---

## Task 1: Write the failing test

**Files:**
- Create: `tests/RangeSavings.test.tsx`

The test verifies that after the rewrite the section still renders its key copy and the new battery icon SVG is present in the DOM. Framer Motion must be mocked (same pattern as `tests/Hero.test.tsx`).

- [ ] **Step 1: Create the test file**

```tsx
// tests/RangeSavings.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          // eslint-disable-next-line react/display-name
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useReducedMotion: () => false,
  }
})

import RangeSavings from '@/components/sections/RangeSavings'

describe('RangeSavings', () => {
  it('renders the section heading', () => {
    render(<RangeSavings />)
    expect(
      screen.getByText('Uma bateria que vai onde tu vais.')
    ).toBeInTheDocument()
  })

  it('renders all four stat descriptors', () => {
    render(<RangeSavings />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia em ciclo WLTP')).toBeInTheDocument()
    expect(screen.getByText('De 20 a 80% em carga rápida')).toBeInTheDocument()
    expect(screen.getByText('Eficiência energética')).toBeInTheDocument()
  })

  it('renders the battery SVG icon', () => {
    const { container } = render(<RangeSavings />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<RangeSavings />)
    expect(
      screen.getByRole('button', { name: /Calcular a minha poupança/i })
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/RangeSavings.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/sections/RangeSavings'` or similar (the import works but the SVG test will fail since the current component has no SVG).

---

## Task 2: Rewrite RangeSavings.tsx

**Files:**
- Modify: `src/components/sections/RangeSavings.tsx`

Implement the full spec: updated imports, `BatteryIcon` sub-component, `sectionRef`, `useScroll` binding, new section/container structure, body text size bump.

> **Note:** The spec's "Files Changed" table mentions `useTransform` — this is a stale artifact from an earlier draft. The final spec body explicitly removes `useTransform`. Do NOT import it.

- [ ] **Step 1: Replace the file contents**

```tsx
'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, type MotionValue } from 'framer-motion'
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function BatteryIcon({ pathLength }: { pathLength: MotionValue<number> }) {
  return (
    <div className="flex justify-center mb-12">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* Track circle */}
        <circle
          cx="40"
          cy="40"
          r="34"
          strokeWidth="1.5"
          stroke="rgba(255,255,255,0.15)"
          fill="none"
        />
        {/* Animated fill arc */}
        <motion.circle
          cx="40"
          cy="40"
          r="34"
          strokeWidth="1.5"
          stroke="#FA5C40"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength, rotate: -90 }}
        />
        {/* Lightning bolt */}
        <path
          d="M 43 22 L 33 42 L 40 42 L 37 58 L 47 38 L 40 38 Z"
          fill="white"
        />
      </svg>
    </div>
  )
}

export default function RangeSavings() {
  const [modalOpen, setModalOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  })

  return (
    <section
      id="autonomia"
      className="bg-background py-32 md:py-40"
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <BatteryIcon pathLength={scrollYProgress} />

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
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
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

---

## Task 3: Run tests and verify

- [ ] **Step 1: Run the new tests**

```bash
npx jest tests/RangeSavings.test.tsx --no-coverage
```

Expected: 4 tests PASS.

- [ ] **Step 2: Run the full test suite to check for regressions**

```bash
npx jest --no-coverage
```

Expected: All tests PASS (no regressions).

---

## Task 4: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open browser at `http://localhost:3000` and scroll to the `#autonomia` section**

Verify:
- Coral circle arc fills from 12 o'clock as the section enters viewport
- Circle is complete by the time the section is centered on screen
- Lightning bolt is white, centered inside the circle
- Section has noticeably more vertical breathing room than before
- Body text is visibly larger than the previous version (matches heading better)
- Content is constrained within a clear max-width container on wide screens

---

## Task 5: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add src/components/sections/RangeSavings.tsx tests/RangeSavings.test.tsx
git commit -m "feat: autonomia section premium redesign — battery icon, spacing, typography"
```
