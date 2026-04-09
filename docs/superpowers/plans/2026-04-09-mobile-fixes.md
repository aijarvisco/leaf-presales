# Mobile Layout Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 mobile layout issues: paragraph sizing in ValuesSection and ClosingSection, Autonomia stats scaling, SavingsCalculator column order, BottomCTABar overflow, and global horizontal overflow containment.

**Architecture:** All changes are targeted Tailwind class edits and minor DOM reordering — no new components, no new abstractions. Tests check className presence for CSS changes, and DOM order for layout changes.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Jest + React Testing Library

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/sections/ValuesSection.tsx` | `text-xl` → `text-base md:text-xl` on paragraph |
| `src/components/sections/AutonomiaSectionV2.tsx` | Replace hardcoded inline font sizes with responsive Tailwind classes; fix `px-16` to `px-4 md:px-16` |
| `src/components/forms/SavingsCalculator.tsx` | Swap column DOM order; add `order-*` classes; hide image on mobile |
| `src/components/sections/ClosingSection.tsx` | `text-xl` → `text-base sm:text-xl` on both CTA paragraphs |
| `src/components/ui/BottomCTABar.tsx` | Add `max-w-[calc(100vw-2rem)]` to outer wrapper |
| `src/app/page.tsx` | Add `overflow-x-hidden` to `<main>` |
| `tests/components/sections/ValuesSection.test.tsx` | Fix stale heading assertion; add paragraph class test |
| `tests/components/sections/AutonomiaSectionV2.test.tsx` | Fix stale text assertions; add responsive class tests |
| `tests/components/sections/ClosingSection.test.tsx` | Add paragraph class tests |
| `tests/components/ui/BottomCTABar.test.tsx` | Add max-width class test |
| `tests/components/forms/SavingsCalculator.test.tsx` | New file: DOM order + image visibility tests |

---

## Task 1: Fix ValuesSection paragraph font size

**Files:**
- Modify: `src/components/sections/ValuesSection.tsx:178–183`
- Modify: `tests/components/sections/ValuesSection.test.tsx`

The paragraph below the section title uses `text-xl` with no mobile breakpoint. It must become `text-base md:text-xl`.

**Note:** The existing test `it('renders the section heading', ...)` asserts `'Designed to make a difference.'` which is stale (the component's default title is `'Conforto e tecnologia<br/>para o seu dia a dia.'`). Fix this stale assertion in the same commit.

- [ ] **Step 1: Update the stale heading test and write a failing paragraph class test**

Replace the existing `ValuesSection.test.tsx` content:

```tsx
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
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useMotionValue: () => ({ get: () => 0, set: () => {}, getVelocity: () => 0 }),
    animate: jest.fn(),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import ValuesSection from '@/components/sections/ValuesSection'

describe('ValuesSection', () => {
  it('renders the section heading', () => {
    render(<ValuesSection />)
    // Default title uses dangerouslySetInnerHTML — text is split at <br/>
    expect(screen.getByText(/Conforto e tecnologia/)).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<ValuesSection />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('renders 4 value cards', () => {
    render(<ValuesSection />)
    expect(screen.getByText('8 anos de garantia na bateria.')).toBeInTheDocument()
    expect(screen.getByText('Do quotidiano à escapadela.')).toBeInTheDocument()
    expect(screen.getByText('Carrega sem complicações.')).toBeInTheDocument()
    expect(screen.getByText('Sempre ligado, onde estiveres.')).toBeInTheDocument()
  })

  it('renders pagination controls', () => {
    const { container } = render(<ValuesSection />)
    const prevButton = container.querySelector('button[aria-label="Anterior"]')
    const nextButton = container.querySelector('button[aria-label="Próximo"]')
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('paragraph below title has text-base class for mobile', () => {
    const { container } = render(<ValuesSection paragraphHtml="Test paragraph" />)
    const para = container.querySelector('p.text-base')
    expect(para).toBeInTheDocument()
  })

  it('paragraph below title does not use text-xl without breakpoint', () => {
    const { container } = render(<ValuesSection paragraphHtml="Test paragraph" />)
    // Should have md:text-xl (responsive), not bare text-xl
    const para = container.querySelector('p.text-xl')
    expect(para).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm failures**

```bash
npx jest tests/components/sections/ValuesSection.test.tsx --no-coverage
```

Expected: the last two tests FAIL (`text-base` not found, `text-xl` found).

- [ ] **Step 3: Fix ValuesSection.tsx**

In `src/components/sections/ValuesSection.tsx`, find the paragraph block around line 178 and change `text-xl` to `text-base md:text-xl`:

```tsx
        {paragraphHtml ? (
          <p
            className="mt-6 text-base md:text-xl text-[#0A0A0A] max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: paragraphHtml }}
          />
        ) : (
          <p className="mt-6 text-base md:text-xl text-[#0A0A0A] max-w-2xl mx-auto leading-relaxed">
            <strong className="font-semibold">Our values lead the way.</strong>{' '}
            Apple Vision Pro was designed to help protect your privacy and keep you in control of your data. Its built‑in accessibility features are designed to work the way you do.
          </p>
        )}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/components/sections/ValuesSection.test.tsx --no-coverage
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ValuesSection.tsx tests/components/sections/ValuesSection.test.tsx
git commit -m "fix(mobile): reduce ValuesSection paragraph font size on mobile"
```

---

## Task 2: Fix Autonomia stats responsive sizing

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx:99–128`
- Modify: `tests/components/sections/AutonomiaSectionV2.test.tsx`

Stats container has `px-16` (cramped on phones) and hardcoded `fontSize: '56px'`/`'21px'` inline styles that don't scale.

**Note:** Existing tests in `AutonomiaSectionV2.test.tsx` have stale text assertions that don't match the current component. These must be fixed as part of this task.

Stale assertions to fix:
- `'Uma bateria que vai onde tu vais.'` → `'Excelência elétrica para chegar mais longe'`
- `'Autonomia em ciclo WLTP'` → `'Autonomia.'`
- `'De 20 a 80% em carga rápida'` → `'de garantia na bateria'`

- [ ] **Step 1: Replace the test file with corrected assertions and new class tests**

```tsx
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
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, output: unknown[]) => output[0],
    useMotionValueEvent: () => {},
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'modal' }, children),
}))

jest.mock('@/components/forms/SavingsCalculator', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'savings-calculator' }),
}))

import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'

describe('AutonomiaSectionV2', () => {
  it('renders the section heading', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Excelência elétrica para chegar mais longe')).toBeInTheDocument()
  })

  it('applies --text-display CSS variable to the heading', () => {
    render(<AutonomiaSectionV2 />)
    const heading = screen.getByText('Excelência elétrica para chegar mais longe')
    expect(heading.style.fontSize).toBe('var(--text-display)')
  })

  it('eyebrow label has text-base class', () => {
    render(<AutonomiaSectionV2 />)
    const eyebrow = screen.getByText('Autonomia')
    expect(eyebrow.className).toContain('text-base')
  })

  it('renders all three stat descriptors', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia.')).toBeInTheDocument()
    expect(screen.getByText('de garantia na bateria')).toBeInTheDocument()
  })

  it('stat numbers use responsive Tailwind classes, not hardcoded inline fontSize', () => {
    const { container } = render(<AutonomiaSectionV2 />)
    // Find the span with stat number "75"
    const numberSpan = screen.getByText('75')
    expect(numberSpan.style.fontSize).toBe('')
    expect(numberSpan.className).toContain('text-4xl')
  })

  it('stats container uses px-4 class for mobile padding', () => {
    const { container } = render(<AutonomiaSectionV2 />)
    // The stats panel div should have px-4
    const statsPanel = container.querySelector('.px-4')
    expect(statsPanel).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm the new tests fail (old ones also fail on stale text)**

```bash
npx jest tests/components/sections/AutonomiaSectionV2.test.tsx --no-coverage
```

Expected: stale text tests FAIL, new class tests FAIL.

- [ ] **Step 3: Update AutonomiaSectionV2.tsx**

Replace the stats panel section (`src/components/sections/AutonomiaSectionV2.tsx:99–128`) with responsive classes:

```tsx
        {/* Stats panel */}
        <motion.div
          className="absolute bottom-24 inset-x-0 z-10 px-4 md:px-16"
          style={{ opacity: statsOpacity }}
        >
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto"
            variants={statsContainerVariants}
            initial="hidden"
            animate={statsVisible ? 'visible' : 'hidden'}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.descriptor} className="flex flex-col" variants={statItemVariants}>
                {stat.qualifier ? (
                  <p className="text-sm md:text-xl text-[#86868b] font-normal">{stat.qualifier}</p>
                ) : (
                  <p aria-hidden="true" className="text-sm md:text-xl text-transparent font-normal">&nbsp;</p>
                )}
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-4xl md:text-5xl font-medium text-white tracking-[-0.02em]">
                    {stat.number}
                  </span>
                  <span className="text-4xl md:text-5xl font-medium text-white tracking-[-0.02em]">
                    {stat.unit}
                  </span>
                </div>
                <p className="text-sm md:text-xl text-[#86868b] font-normal">{stat.descriptor}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/components/sections/AutonomiaSectionV2.test.tsx --no-coverage
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx tests/components/sections/AutonomiaSectionV2.test.tsx
git commit -m "fix(mobile): responsive font sizes for Autonomia stats panel"
```

---

## Task 3: Fix SavingsCalculator mobile layout

**Files:**
- Modify: `src/components/forms/SavingsCalculator.tsx`
- Create: `tests/components/forms/SavingsCalculator.test.tsx`

On mobile, the savings summary should appear above the inputs, and the car image should be hidden.

Current layout: `flex-col md:flex-row` — left column (inputs) then right column (savings).
After fix: savings column is first in DOM, inputs second. `order-2 md:order-1` on inputs, `order-1 md:order-2` on savings. Car image gets `hidden md:block`.

- [ ] **Step 1: Create the test file**

Create `tests/components/forms/SavingsCalculator.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import SavingsCalculator from '@/components/forms/SavingsCalculator'

describe('SavingsCalculator', () => {
  it('renders the calculator heading', () => {
    render(<SavingsCalculator />)
    expect(screen.getByText('Calculador de Poupança')).toBeInTheDocument()
  })

  it('savings column appears before inputs column in the DOM', () => {
    const { container } = render(<SavingsCalculator />)
    const savingsCol = container.querySelector('.order-1')
    const inputsCol = container.querySelector('.order-2')
    expect(savingsCol).toBeInTheDocument()
    expect(inputsCol).toBeInTheDocument()
    // Savings column should come first in the DOM
    const allOrderedCols = container.querySelectorAll('.order-1, .order-2')
    expect(allOrderedCols[0]).toBe(savingsCol)
    expect(allOrderedCols[1]).toBe(inputsCol)
  })

  it('car image is hidden on mobile', () => {
    const { container } = render(<SavingsCalculator />)
    const imageWrapper = container.querySelector('.hidden.md\\:block')
    expect(imageWrapper).toBeInTheDocument()
  })

  it('renders the annual savings value', () => {
    render(<SavingsCalculator />)
    // Default: 15000km/yr, 0.15€/kWh, 6l/100km, 1.90€/l
    // EV cost: 15000 * (15/100) * 0.15 = 337.50€
    // ICE cost: 15000 * (6/100) * 1.90 = 1710€
    // Savings: 1710 - 337.50 = 1372.50€
    expect(screen.getByText(/1\.372,50 €/)).toBeInTheDocument()
  })

  it('renders the "Estou interessado" button when onInterested is provided', () => {
    const onInterested = jest.fn()
    render(<SavingsCalculator onInterested={onInterested} />)
    expect(screen.getByRole('button', { name: /estou interessado/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm failures**

```bash
npx jest tests/components/forms/SavingsCalculator.test.tsx --no-coverage
```

Expected: `order-1`/`order-2` and `hidden md:block` tests FAIL.

- [ ] **Step 3: Update SavingsCalculator.tsx**

Replace the outer `<div>` and column structure in `src/components/forms/SavingsCalculator.tsx`:

```tsx
  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-8 p-6 md:px-24 md:py-16 min-h-[85vh]">

      {/* Right column — results (order-1 = first on mobile, order-2 = second on desktop) */}
      <div className="flex flex-col items-start gap-4 flex-1 min-w-0 order-1 md:order-2">
        <h3 className="text-xl font-medium tracking-[-0.04em] text-[#0A0A0A]">
          Calculador de Poupança
        </h3>

        <p
          className="font-medium tracking-[-0.04em] leading-none text-[#34C759]"
          style={{ fontSize: '48px' }}
        >
          {results.annual_savings.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>
        <p className="text-sm text-[#86868b] -mt-2">Poupança anual</p>

        <div className="flex gap-8">
          <div>
            <p className="text-xl font-medium text-[#0A0A0A] tracking-[-0.03em]">
              {results.monthly_savings.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
            <p className="text-xs text-[#86868b]">Poupança Mensal</p>
          </div>
          <div>
            <p className="text-xl font-medium text-[#0A0A0A] tracking-[-0.03em]">
              {results.savings_per_km.toLocaleString('pt-PT', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} €/km
            </p>
            <p className="text-xs text-[#86868b]">Poupança Km</p>
          </div>
        </div>

        <div className="hidden md:block relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f7]">
          <Image
            src="/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png"
            alt="Nissan Leaf"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Left column — inputs (order-2 = second on mobile, order-1 = first on desktop) */}
      <div className="flex flex-col gap-4 flex-1 min-w-0 order-2 md:order-1">

        <Stepper
          label="Distância percorrida anual"
          unit="Km"
          display={inputs.km_per_year.toLocaleString('pt-PT')}
          onDecrement={() => update('km_per_year', -500, 1000, 100000)}
          onIncrement={() => update('km_per_year',  500, 1000, 100000)}
        />

        <CostBox label="Custos com Viatura EV" value={results.ev_cost_year} highlight />

        <Stepper
          label="Custo da Eletricidade"
          unit="€ / kWh"
          display={inputs.ev_energy_price_per_kwh.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onDecrement={() => update('ev_energy_price_per_kwh', -0.01, 0.05, 0.50)}
          onIncrement={() => update('ev_energy_price_per_kwh',  0.01, 0.05, 0.50)}
        />

        <div className="flex items-center justify-between text-sm text-[#86868b] px-1">
          <span>Consumo de energia</span>
          <span className="font-medium text-[#0A0A0A]">{LEAF_KWH_PER_100KM} kWh/100 Km</span>
        </div>

        <CostBox label="Custos com Viatura Combustão" value={results.ice_cost_year} />

        <Stepper
          label="Custo do Combustível"
          unit="€ /litro"
          display={inputs.fuel_price_per_l.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onDecrement={() => update('fuel_price_per_l', -0.05, 0.50, 3.00)}
          onIncrement={() => update('fuel_price_per_l',  0.05, 0.50, 3.00)}
        />

        <Stepper
          label="Consumo de combustível"
          unit="l/100km"
          display={inputs.ice_consumption_l_per_100km.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          onDecrement={() => update('ice_consumption_l_per_100km', -0.5, 3, 15)}
          onIncrement={() => update('ice_consumption_l_per_100km',  0.5, 3, 15)}
        />

        <p className="text-xs text-[#86868b] leading-relaxed pt-2">
          Os valores são meramente indicativos e baseados nos dados introduzidos. O consumo real pode variar consoante o estilo de condução, condições climatéricas e tarifas em vigor.
        </p>

        {onInterested && (
          <button
            onClick={onInterested}
            className="mt-2 w-full bg-[#0A0A0A] hover:bg-[#1c1c1e] text-white font-medium rounded-xl py-3.5 text-sm tracking-[-0.01em] transition-colors cursor-pointer"
          >
            Estou interessado
          </button>
        )}
      </div>

    </div>
  )
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/components/forms/SavingsCalculator.test.tsx --no-coverage
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/SavingsCalculator.tsx tests/components/forms/SavingsCalculator.test.tsx
git commit -m "fix(mobile): savings summary first, inputs below, hide image on mobile"
```

---

## Task 4: Fix ClosingSection CTA paragraph sizing

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:69,89`
- Modify: `tests/components/sections/ClosingSection.test.tsx`

Both CTA card paragraphs use `text-xl` with no mobile breakpoint. Change to `text-base sm:text-xl`.

- [ ] **Step 1: Add failing tests to ClosingSection.test.tsx**

Add two new tests to the existing `describe('ClosingSection', ...)` block:

```tsx
  it('CTA paragraphs have text-base class for mobile', () => {
    const { container } = render(<ClosingSection />)
    const paras = container.querySelectorAll('p.text-base')
    // Both CTA card paragraphs should have text-base
    expect(paras.length).toBeGreaterThanOrEqual(2)
  })

  it('CTA paragraphs do not use bare text-xl without breakpoint', () => {
    const { container } = render(<ClosingSection />)
    // text-xl without a breakpoint prefix should not appear on these paragraphs
    const barePara = container.querySelector('button p.text-xl:not([class*="sm:text-xl"])')
    expect(barePara).toBeNull()
  })
```

- [ ] **Step 2: Run tests to confirm the new tests fail**

```bash
npx jest tests/components/sections/ClosingSection.test.tsx --no-coverage
```

Expected: the two new tests FAIL.

- [ ] **Step 3: Update ClosingSection.tsx**

Change the two `<p className="text-xl ...">` lines inside the CTA buttons (lines 69 and 89):

```tsx
            {/* Small CTA — "Fale connosco" paragraph */}
                <p className="text-base sm:text-xl font-medium text-white/80 leading-snug tracking-[-0.02em] max-w-[70%]">
                  Tem dúvidas? A nossa equipa responde em menos de 24 horas.
                </p>
```

```tsx
            {/* Large CTA — "Reservar" paragraph */}
                <p className="text-base sm:text-xl font-medium text-white leading-snug tracking-[-0.02em] max-w-[70%]">
                  300€ totalmente reembolsáveis · Garanta o seu lugar entre os primeiros. Sem compromisso, sem risco.
                </p>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/components/sections/ClosingSection.test.tsx --no-coverage
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ClosingSection.tsx tests/components/sections/ClosingSection.test.tsx
git commit -m "fix(mobile): reduce ClosingSection CTA paragraph font size on mobile"
```

---

## Task 5: Fix BottomCTABar viewport overflow

**Files:**
- Modify: `src/components/ui/BottomCTABar.tsx:102`
- Modify: `tests/components/ui/BottomCTABar.test.tsx`

The outer `fixed` div has no width cap, allowing it to overflow the viewport on mobile. Add `max-w-[calc(100vw-2rem)]`.

- [ ] **Step 1: Add failing test to BottomCTABar.test.tsx**

Add to the existing `describe('BottomCTABar', ...)` block, inside the `// ── Responsive layout` section:

```tsx
  it('outer wrapper has max-w-[calc(100vw-2rem)] to prevent viewport overflow', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain('max-w-[calc(100vw-2rem)]')
  })
```

- [ ] **Step 2: Run tests to confirm the new test fails**

```bash
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage
```

Expected: the new test FAILS.

- [ ] **Step 3: Update BottomCTABar.tsx**

In `src/components/ui/BottomCTABar.tsx`, the outer `<div>` at line 102, add `max-w-[calc(100vw-2rem)]`:

```tsx
    <div
      ref={barRef}
      className={`fixed left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
```

- [ ] **Step 4: Run all BottomCTABar tests**

```bash
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage
```

Expected: all tests PASS (the new one and all existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx tests/components/ui/BottomCTABar.test.tsx
git commit -m "fix(mobile): constrain BottomCTABar width to viewport on mobile"
```

---

## Task 6: Global horizontal overflow containment

**Files:**
- Modify: `src/app/page.tsx`

Add `overflow-x-hidden` to `<main>` so no element overflows horizontally on mobile. The `ValuesSection` carousel is the explicit exception — it already has its own `overflow-hidden` on the carousel div, so it won't be double-clipped; the `motion.div` track inside it still overflows within the carousel boundary.

No unit test is practical here (it's a layout containment property that requires a browser). Verify visually after applying.

- [ ] **Step 1: Update page.tsx**

In `src/app/page.tsx`, add `overflow-x-hidden` to `<main>`:

```tsx
      <main className="overflow-x-hidden">
```

- [ ] **Step 2: Run full test suite to catch regressions**

```bash
npx jest --no-coverage
```

Expected: all tests PASS. Any failure means a regression was introduced — investigate before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix(mobile): prevent horizontal overflow on mobile with overflow-x-hidden on main"
```

---

## Final Verification

- [ ] **Run all tests once more**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Visual check on mobile viewport**

Open the dev server (`npm run dev`) and open DevTools with a 390px viewport (iPhone 15 size). Verify:
1. Interior and Charging section paragraphs are smaller on mobile vs desktop
2. Autonomia stats are readable and fit within the screen
3. Savings calculator shows the savings summary above the inputs; car image is hidden
4. Closing section CTA paragraphs are smaller on mobile
5. Floating CTA bar pill doesn't overflow the screen edges
6. No unexpected horizontal scroll anywhere (except carousel swipe)
