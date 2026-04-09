# Savings Calculator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing savings calculator modal with a bottom-sheet modal, a two-column EV vs ICE calculator layout, and a new savings formula.

**Architecture:** Four files are rewritten in dependency order: types first (shared interfaces), then the pure formula function, then the two UI components. Each task is self-contained and tested before moving to the next. `AutonomiaSectionV2.tsx` is never touched — its Modal import and usage are unchanged.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Framer Motion, Tailwind CSS, Jest + Testing Library (tests in `tests/` directory, matched by `<rootDir>/tests/**/*.test.ts(x)`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types/index.ts` | Modify | Replace `SavingsInputs`/`SavingsResult` with `EVSavingsInputs`/`EVSavingsResult` |
| `src/lib/savings.ts` | Full rewrite | Pure `calculateEVSavings` function with EV vs ICE formula |
| `src/components/ui/Modal.tsx` | Full rewrite | Generic bottom-sheet portal component |
| `src/components/forms/SavingsCalculator.tsx` | Full rewrite | Two-column calculator UI consuming `calculateEVSavings` |
| `tests/lib/savings.test.ts` | Full rewrite | Unit tests for the new formula |
| `tests/components/ui/Modal.test.tsx` | New file | Behaviour tests for the bottom-sheet modal |

---

## Task 1: Update types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Replace the savings types**

Open `src/types/index.ts` and replace the `SavingsInputs` and `SavingsResult` interfaces with:

```ts
export interface EVSavingsInputs {
  km_per_year: number
  ev_energy_price_per_kwh: number
  ice_consumption_l_per_100km: number
  fuel_price_per_l: number
  adjustment_factors?: {
    driving?: number
    temperature?: number
    load?: number
  }
}

export interface EVSavingsResult {
  ev_cost_year: number
  ice_cost_year: number
  annual_savings: number
  monthly_savings: number
  savings_per_km: number
}
```

The full updated file should look like:

```ts
import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'outline'

export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
}

export interface EVSavingsInputs {
  km_per_year: number
  ev_energy_price_per_kwh: number
  ice_consumption_l_per_100km: number
  fuel_price_per_l: number
  adjustment_factors?: {
    driving?: number
    temperature?: number
    load?: number
  }
}

export interface EVSavingsResult {
  ev_cost_year: number
  ice_cost_year: number
  annual_savings: number
  monthly_savings: number
  savings_per_km: number
}

export type ConfiguratorView = 'exterior' | 'interior'

export interface VehicleVersion {
  id: string
  name: string
  price: number
  isPopular?: boolean
  features: Record<string, boolean | string>
}

export interface StatCardData {
  id: string
  stat: string
  unit: string
  descriptor: string
  modalContent: ReactNode
}

export interface ContactFormData {
  nome: string
  telemovel: string
  email: string
  distrito: string
  concessionarioId: string
  mensagem?: string
  privacyConsent: boolean
  marketingConsent: boolean
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors related to `SavingsInputs` or `SavingsResult`. (There will be errors in `savings.ts` and `SavingsCalculator.tsx` since those still reference old types — that's expected and will be fixed in subsequent tasks.)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor: replace SavingsInputs/Result types with EVSavingsInputs/EVSavingsResult"
```

---

## Task 2: Rewrite savings formula

**Files:**
- Modify: `src/lib/savings.ts`
- Modify: `tests/lib/savings.test.ts`

- [ ] **Step 1: Write the failing tests first**

Replace the entire contents of `tests/lib/savings.test.ts`:

```ts
import { calculateEVSavings } from '@/lib/savings'

describe('calculateEVSavings', () => {
  const base = {
    km_per_year: 15000,
    ev_energy_price_per_kwh: 0.15,
    ice_consumption_l_per_100km: 6,
    fuel_price_per_l: 1.90,
  }

  it('returns all zeros when km_per_year is 0', () => {
    const result = calculateEVSavings({ ...base, km_per_year: 0 })
    expect(result.ev_cost_year).toBe(0)
    expect(result.ice_cost_year).toBe(0)
    expect(result.annual_savings).toBe(0)
    expect(result.monthly_savings).toBe(0)
    expect(result.savings_per_km).toBe(0)
  })

  it('calculates ev_cost_year correctly', () => {
    // (15000/100) * 15 * 0.15 = 337.50
    const result = calculateEVSavings(base)
    expect(result.ev_cost_year).toBe(337.50)
  })

  it('calculates ice_cost_year correctly', () => {
    // (15000/100) * 6 * 1.90 = 1710.00
    const result = calculateEVSavings(base)
    expect(result.ice_cost_year).toBe(1710.00)
  })

  it('calculates annual_savings correctly', () => {
    // 1710.00 - 337.50 = 1372.50
    const result = calculateEVSavings(base)
    expect(result.annual_savings).toBe(1372.50)
  })

  it('calculates monthly_savings correctly', () => {
    // 1372.50 / 12 = 114.375 → rounded to 2dp = 114.38
    const result = calculateEVSavings(base)
    expect(result.monthly_savings).toBe(114.38)
  })

  it('calculates savings_per_km correctly', () => {
    // 1372.50 / 15000 = 0.0915 → rounded to 4dp = 0.0915
    const result = calculateEVSavings(base)
    expect(result.savings_per_km).toBe(0.0915)
  })

  it('applies adjustment factors when provided', () => {
    // driving=1.1, temperature=1, load=1
    // adjusted_ev  = 15 * 1.1 = 16.5
    // adjusted_ice = 6 * 1.1 = 6.6
    // ev_cost  = (15000/100) * 16.5 * 0.15 = 371.25
    // ice_cost = (15000/100) * 6.6 * 1.90 = 1881.00
    const result = calculateEVSavings({
      ...base,
      adjustment_factors: { driving: 1.1 },
    })
    expect(result.ev_cost_year).toBe(371.25)
    expect(result.ice_cost_year).toBe(1881.00)
  })

  it('defaults missing adjustment factors to 1', () => {
    const withEmpty = calculateEVSavings({ ...base, adjustment_factors: {} })
    const withNone = calculateEVSavings(base)
    expect(withEmpty.annual_savings).toBe(withNone.annual_savings)
  })

  it('rounds costs to 2 decimal places', () => {
    // Use values that produce fractional cents
    const result = calculateEVSavings({
      km_per_year: 10000,
      ev_energy_price_per_kwh: 0.13,
      ice_consumption_l_per_100km: 7,
      fuel_price_per_l: 1.87,
    })
    expect(result.ev_cost_year).toBe(195.00)   // (10000/100)*15*0.13 = 195.00
    expect(result.ice_cost_year).toBe(1309.00)  // (10000/100)*7*1.87 = 1309.00
  })

  it('rounds savings_per_km to 4 decimal places', () => {
    const result = calculateEVSavings({
      km_per_year: 12000,
      ev_energy_price_per_kwh: 0.15,
      ice_consumption_l_per_100km: 6,
      fuel_price_per_l: 1.90,
    })
    // ev_cost  = (12000/100)*15*0.15 = 270.00
    // ice_cost = (12000/100)*6*1.90  = 1368.00
    // annual   = 1098.00
    // per_km   = 1098/12000 = 0.0915
    expect(result.savings_per_km).toBe(0.0915)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest tests/lib/savings.test.ts --no-coverage
```

Expected: All tests FAIL with `calculateEVSavings is not a function` or similar.

- [ ] **Step 3: Rewrite savings.ts**

Replace the entire contents of `src/lib/savings.ts`:

```ts
import type { EVSavingsInputs, EVSavingsResult } from '@/types'

const LEAF_KWH_PER_100KM = 15

export function calculateEVSavings(inputs: EVSavingsInputs): EVSavingsResult {
  const { km_per_year, ev_energy_price_per_kwh, ice_consumption_l_per_100km, fuel_price_per_l } = inputs

  if (km_per_year === 0) {
    return { ev_cost_year: 0, ice_cost_year: 0, annual_savings: 0, monthly_savings: 0, savings_per_km: 0 }
  }

  const driving     = inputs.adjustment_factors?.driving     ?? 1
  const temperature = inputs.adjustment_factors?.temperature ?? 1
  const load        = inputs.adjustment_factors?.load        ?? 1

  const adjusted_ev_consumption  = LEAF_KWH_PER_100KM * driving * temperature * load
  const adjusted_ice_consumption = ice_consumption_l_per_100km * driving * temperature * load

  const ev_cost_year  = round2((km_per_year / 100) * adjusted_ev_consumption  * ev_energy_price_per_kwh)
  const ice_cost_year = round2((km_per_year / 100) * adjusted_ice_consumption * fuel_price_per_l)

  const annual_savings  = round2(ice_cost_year - ev_cost_year)
  const monthly_savings = round2(annual_savings / 12)
  const savings_per_km  = round4(annual_savings / km_per_year)

  return { ev_cost_year, ice_cost_year, annual_savings, monthly_savings, savings_per_km }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npx jest tests/lib/savings.test.ts --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/savings.ts tests/lib/savings.test.ts
git commit -m "feat: rewrite savings formula for EV vs ICE comparison"
```

---

## Task 3: Rewrite Modal as bottom-sheet

**Files:**
- Modify: `src/components/ui/Modal.tsx`
- Create: `tests/components/ui/Modal.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/ui/Modal.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

import Modal from '@/components/ui/Modal'

describe('Modal (bottom-sheet)', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
    document.body.style.overflow = ''
  })

  it('renders children when open', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Calculator content</p></Modal>)
    })
    expect(screen.getByText('Calculator content')).toBeInTheDocument()
  })

  it('renders nothing when closed', async () => {
    await act(async () => {
      render(<Modal open={false} onClose={onClose}><p>Calculator content</p></Modal>)
    })
    expect(screen.queryByText('Calculator content')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when closed', async () => {
    await act(async () => {
      render(<Modal open={false} onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll when open', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('panel has white background class', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    const panel = screen.getByTestId('modal-panel')
    expect(panel.className).toContain('bg-white')
  })

  it('panel has rounded-t-2xl class', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    const panel = screen.getByTestId('modal-panel')
    expect(panel.className).toContain('rounded-t-2xl')
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest tests/components/ui/Modal.test.tsx --no-coverage
```

Expected: Multiple failures including `modal-backdrop` and `modal-panel` not found.

- [ ] **Step 3: Rewrite Modal.tsx**

Replace the entire contents of `src/components/ui/Modal.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            data-testid="modal-backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom-sheet panel */}
          <motion.div
            data-testid="modal-panel"
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 text-[#0A0A0A]/40 hover:text-[#0A0A0A] text-2xl leading-none cursor-pointer"
            >
              ×
            </button>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npx jest tests/components/ui/Modal.test.tsx --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 5: Run the full test suite to catch regressions**

```bash
npx jest --no-coverage
```

Expected: All tests pass. The `AutonomiaSectionV2` test mocks `Modal` so it is unaffected.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Modal.tsx tests/components/ui/Modal.test.tsx
git commit -m "feat: replace Modal with bottom-sheet portal component"
```

---

## Task 4: Rewrite SavingsCalculator

**Files:**
- Modify: `src/components/forms/SavingsCalculator.tsx`

No new test file is needed — the existing `AutonomiaSectionV2` test mocks `SavingsCalculator`, and the formula is already covered in Task 2. This component is pure UI wiring; smoke-test via browser.

- [ ] **Step 1: Rewrite SavingsCalculator.tsx**

Replace the entire contents of `src/components/forms/SavingsCalculator.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { calculateEVSavings } from '@/lib/savings'

const LEAF_KWH_PER_100KM = 15

const DEFAULTS = {
  km_per_year: 15000,
  ev_energy_price_per_kwh: 0.15,
  ice_consumption_l_per_100km: 6,
  fuel_price_per_l: 1.90,
}

export default function SavingsCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS)
  const results = calculateEVSavings(inputs)

  function update(key: keyof typeof DEFAULTS, step: number, min: number, max: number) {
    setInputs((prev) => ({
      ...prev,
      [key]: Math.min(max, Math.max(min, parseFloat((prev[key] + step).toFixed(10)))),
    }))
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10">

      {/* Left column — inputs */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        <Stepper
          label="Distância percorrida anual"
          value={inputs.km_per_year}
          unit="Km"
          display={inputs.km_per_year.toLocaleString('pt-PT')}
          onDecrement={() => update('km_per_year', -500, 1000, 100000)}
          onIncrement={() => update('km_per_year',  500, 1000, 100000)}
        />

        <CostBox label="Custos com Viatura EV" value={results.ev_cost_year} highlight />

        <Stepper
          label="Custo da Eletricidade"
          value={inputs.ev_energy_price_per_kwh}
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
          value={inputs.fuel_price_per_l}
          unit="€ /litro"
          display={inputs.fuel_price_per_l.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onDecrement={() => update('fuel_price_per_l', -0.05, 0.50, 3.00)}
          onIncrement={() => update('fuel_price_per_l',  0.05, 0.50, 3.00)}
        />

        <Stepper
          label="Consumo de combustível"
          value={inputs.ice_consumption_l_per_100km}
          unit="l/100km"
          display={inputs.ice_consumption_l_per_100km.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          onDecrement={() => update('ice_consumption_l_per_100km', -0.5, 3, 15)}
          onIncrement={() => update('ice_consumption_l_per_100km',  0.5, 3, 15)}
        />
      </div>

      {/* Right column — results */}
      <div className="flex flex-col items-start gap-4 flex-1 min-w-0">
        <h3 className="text-xl font-medium tracking-[-0.04em] text-[#0A0A0A]">
          Calculador de Poupança
        </h3>

        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f7]">
          <Image
            src="/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png"
            alt="Nissan Leaf"
            fill
            className="object-contain"
          />
        </div>

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
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stepper({
  label,
  display,
  unit,
  onDecrement,
  onIncrement,
}: {
  label: string
  value: number
  unit: string
  display: string
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-[#86868b]">{label}</span>
      <div className="flex items-center justify-between border border-[#d2d2d7] rounded-lg px-3 py-2">
        <button
          onClick={onDecrement}
          className="text-[#0A0A0A] text-lg leading-none w-6 h-6 flex items-center justify-center hover:text-[#E8453C] cursor-pointer"
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <span className="text-sm font-medium text-[#0A0A0A]">
          {display} {unit}
        </span>
        <button
          onClick={onIncrement}
          className="text-[#0A0A0A] text-lg leading-none w-6 h-6 flex items-center justify-center hover:text-[#E8453C] cursor-pointer"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

function CostBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="border border-[#d2d2d7] rounded-lg px-4 py-3">
      <p className="text-xs text-[#86868b] mb-1">{label}</p>
      <p
        className="text-2xl font-medium tracking-[-0.03em]"
        style={{ color: highlight ? '#34C759' : '#0A0A0A' }}
      >
        {value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </p>
      <p className="text-xs text-[#86868b]">Custo anual</p>
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/forms/SavingsCalculator.tsx
git commit -m "feat: rewrite SavingsCalculator with stepper layout and EV vs ICE results"
```

---

## Task 5: Smoke test in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify the modal**

Navigate to the autonomia section. Click "Calcule o que vai poupar". Verify:
- Modal slides up from the bottom
- Glass overlay (`bg-black/60 backdrop-blur-sm`) visible behind
- White panel with rounded top corners
- `×` close button top-right works
- Clicking the backdrop closes the modal
- Pressing Escape closes the modal
- Body scroll is locked while modal is open

- [ ] **Step 3: Verify the calculator**

Inside the modal, verify:
- Left column shows all 4 steppers + 2 cost boxes + 1 static row
- `+` and `−` buttons update values and recalculate instantly
- EV cost box shows in green, ICE cost box in dark
- Right column shows Leaf image, annual savings in large green text, monthly + per-km below
- Numbers formatted with Portuguese locale (dot thousands, comma decimal)

- [ ] **Step 4: Final commit if any tweaks were made**

```bash
git add -p
git commit -m "fix: visual tweaks from smoke test"
```
