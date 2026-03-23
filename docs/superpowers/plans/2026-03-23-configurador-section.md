# Configurador Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `VersionComparison` section with a sticky two-panel mini-configurator (`id="configurador"`) that lets users explore the Nissan Leaf by version, exterior colour, and interior colour, with a live image panel on the left and a fixed CTA bar at the bottom.

**Architecture:** A main `Configurador.tsx` section component owns all state and renders a sticky `ImagePanel` (left, 55%), a scrollable `OptionsPanel` (right, 45%), and a fixed `StickyBar` (bottom). State flows down as props — no external state library. The `onSelectVersion` prop wires into the existing `page.tsx` state so `CTASection` and `ClosingSection` continue to work.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Testing Library + Jest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/configurator/configuradorData.ts` | All static data: VERSIONS, EXTERIOR_COLORS, INTERIOR_IMAGES |
| Create | `src/components/configurator/StickyBar.tsx` | Fixed bottom CTA bar |
| Create | `src/components/configurator/ImagePanel.tsx` | Left sticky viewer (exterior crossfade + interior slider) |
| Create | `src/components/configurator/OptionsPanel.tsx` | Right scrollable panel (version tabs, colour rows, inclusions) |
| Create | `src/components/sections/Configurador.tsx` | Main section: owns state, composes the above |
| Modify | `src/app/page.tsx` | Swap VersionComparison → Configurador, add `pb-24 md:pb-20` |
| Delete | `src/components/sections/VersionComparison.tsx` | Replaced — delete after integration |
| Rename | `public/images/exterior-colors/UNIVERSAL BLUE .png` | Remove trailing space |
| Commit | `public/images/exterior-colors/*` | Stage all 6 exterior-color images |
| Commit | `public/images/889*` (7 interior images) | Stage 7 untracked interior images |
| Create | `tests/Configurador.test.tsx` | Tests for Configurador section |
| Create | `tests/StickyBar.test.tsx` | Tests for StickyBar |
| Create | `tests/configuradorData.test.ts` | Tests for pure data/logic functions |

---

## Task 0: Pre-flight — rename image file and commit assets

**Files:**
- Rename: `public/images/exterior-colors/UNIVERSAL BLUE .png` → `public/images/exterior-colors/UNIVERSAL BLUE.png`

- [ ] **Step 1: Rename the file with git mv**

```bash
cd public/images/exterior-colors
git mv "UNIVERSAL BLUE .png" "UNIVERSAL BLUE.png"
```

Expected: no error, git tracks the rename.

- [ ] **Step 2: Stage and commit all untracked image assets**

```bash
git add "public/images/exterior-colors/"
git add public/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg
git add public/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg
git add public/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg
git add public/images/889862-F275-25TDIEU_PZ1D_04_LO.jpg
git add public/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg
git add public/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg
git add public/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg
git commit -m "feat: add exterior-color and interior images for Configurador section"
```

---

## Task 1: Data layer

**Files:**
- Create: `src/components/configurator/configuradorData.ts`
- Create: `tests/configuradorData.test.ts`

All static content and the one pure logic function (`getVersionInclusions`) live here, isolated from React. This keeps components clean and makes the delta logic independently testable.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/configuradorData.test.ts
import {
  VERSIONS,
  EXTERIOR_COLORS,
  INTERIOR_IMAGES,
  getVersionInclusions,
} from '@/components/configurator/configuradorData'

describe('VERSIONS', () => {
  it('has exactly 3 versions', () => {
    expect(VERSIONS).toHaveLength(3)
  })

  it('version ids are visia, n-connecta, tekna', () => {
    expect(VERSIONS.map(v => v.id)).toEqual(['visia', 'n-connecta', 'tekna'])
  })

  it('all versions have a price > 0', () => {
    VERSIONS.forEach(v => expect(v.price).toBeGreaterThan(0))
  })
})

describe('EXTERIOR_COLORS', () => {
  it('has exactly 6 colours', () => {
    expect(EXTERIOR_COLORS).toHaveLength(6)
  })

  it('no colour id contains a trailing space', () => {
    EXTERIOR_COLORS.forEach(c => expect(c.id).toBe(c.id.trim()))
  })

  it('all imageSrc values use the correct directory', () => {
    EXTERIOR_COLORS.forEach(c =>
      expect(c.imageSrc).toMatch(/^\/images\/exterior-colors\//)
    )
  })
})

describe('INTERIOR_IMAGES', () => {
  it('has 7 images', () => {
    expect(INTERIOR_IMAGES).toHaveLength(7)
  })
})

describe('getVersionInclusions', () => {
  it('visia returns all true features', () => {
    const items = getVersionInclusions('visia')
    items.forEach(item => expect(item.label).toBeTruthy())
    // Visia has no "inherited from previous" note
    expect(items.some(i => i.inherited)).toBe(false)
  })

  it('n-connecta returns only the delta vs visia, plus inherited flag', () => {
    const visiaTrue = VERSIONS[0].features
    const nConnectaItems = getVersionInclusions('n-connecta')
    // All delta items must be false in visia and true in n-connecta
    const deltaLabels = nConnectaItems.map(i => i.label)
    deltaLabels.forEach(label => {
      expect(visiaTrue[label]).toBe(false)
    })
  })

  it('tekna returns only the delta vs n-connecta', () => {
    const nConnectaFeatures = VERSIONS[1].features
    const teknaItems = getVersionInclusions('tekna')
    teknaItems.forEach(item => {
      expect(nConnectaFeatures[item.label]).toBe(false)
    })
  })

  it('returns empty array for unknown version id', () => {
    expect(getVersionInclusions('unknown')).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL (module not found)**

```bash
npx jest tests/configuradorData.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/configurator/configuradorData'`

- [ ] **Step 3: Create the data file**

```ts
// src/components/configurator/configuradorData.ts

export interface Version {
  id: string
  name: string
  price: number
  isPopular: boolean
  features: Record<string, boolean>
}

export interface ExteriorColor {
  id: string
  name: string
  hex: string
  imageSrc: string
}

export interface InclusionItem {
  label: string
  inherited: boolean
}

export const VERSIONS: Version[] = [
  {
    id: 'visia',
    name: 'Visia',
    price: 29990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': false,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': false,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'n-connecta',
    name: 'N-Connecta',
    price: 34490,
    isPopular: true,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'tekna',
    name: 'Tekna',
    price: 38990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': true,
      'Sistema de som premium': true,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
]

export const EXTERIOR_COLORS: ExteriorColor[] = [
  { id: 'TURQUOISE',       name: 'Turquoise',       hex: '#4ABFBF', imageSrc: '/images/exterior-colors/TURQUOISE.png' },
  { id: 'FUJI SUNSET RED', name: 'Fuji Sunset Red', hex: '#C0392B', imageSrc: '/images/exterior-colors/FUJI SUNSET RED.png' },
  { id: 'PEARL WHITE',     name: 'Pearl White',     hex: '#F5F5F0', imageSrc: '/images/exterior-colors/PEARL WHITE.png' },
  { id: 'UNIVERSAL BLUE',  name: 'Universal Blue',  hex: '#2C4A8E', imageSrc: '/images/exterior-colors/UNIVERSAL BLUE.png' },
  { id: 'CERAMIC GREY',    name: 'Ceramic Grey',    hex: '#A8A8A0', imageSrc: '/images/exterior-colors/CERAMIC GREY.png' },
  { id: 'SKYLINE GREY',    name: 'Skyline Grey',    hex: '#6B6B6B', imageSrc: '/images/exterior-colors/SKYLINE GREY.png' },
]

export const INTERIOR_IMAGES: string[] = [
  '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
  '/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg',
  '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
  '/images/889862-F275-25TDIEU_PZ1D_04_LO.jpg',
  '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
  '/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg',
  '/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg',
]

/**
 * Returns the features to display in the Inclusions section for a given version.
 * - Visia: all features where value === true
 * - N-Connecta: only features that are true in N-Connecta but false in Visia (delta)
 * - Tekna: only features that are true in Tekna but false in N-Connecta (delta)
 * Returns [] for unknown version ids.
 */
export function getVersionInclusions(versionId: string): InclusionItem[] {
  const index = VERSIONS.findIndex(v => v.id === versionId)
  if (index === -1) return []

  const version = VERSIONS[index]

  if (index === 0) {
    // Visia: show all true features
    return Object.entries(version.features)
      .filter(([, value]) => value)
      .map(([label]) => ({ label, inherited: false }))
  }

  // N-Connecta / Tekna: show delta vs previous version
  const previous = VERSIONS[index - 1]
  return Object.entries(version.features)
    .filter(([label, value]) => value && !previous.features[label])
    .map(([label]) => ({ label, inherited: false }))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest tests/configuradorData.test.ts --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/configurator/configuradorData.ts tests/configuradorData.test.ts
git commit -m "feat: add Configurador data layer and getVersionInclusions logic"
```

---

## Task 2: StickyBar component

**Files:**
- Create: `src/components/configurator/StickyBar.tsx`
- Create: `tests/StickyBar.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/StickyBar.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StickyBar from '@/components/configurator/StickyBar'

describe('StickyBar', () => {
  const defaultProps = {
    versionName: 'N-Connecta',
    price: 34490,
    onReserve: jest.fn(),
  }

  it('renders the model and version name', () => {
    render(<StickyBar {...defaultProps} />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
    expect(screen.getByText('N-Connecta')).toBeInTheDocument()
  })

  it('renders the price formatted in Portuguese locale', () => {
    render(<StickyBar {...defaultProps} />)
    // pt-PT formats 34490 as "34 490" or "34.490" — just check it contains 34
    expect(screen.getByText(/34/)).toBeInTheDocument()
  })

  it('calls onReserve when the CTA button is clicked', () => {
    const onReserve = jest.fn()
    render(<StickyBar {...defaultProps} onReserve={onReserve} />)
    fireEvent.click(screen.getByRole('button', { name: /reservar/i }))
    expect(onReserve).toHaveBeenCalledTimes(1)
  })

  it('updates when version changes', () => {
    const { rerender } = render(<StickyBar {...defaultProps} />)
    rerender(<StickyBar {...defaultProps} versionName="Tekna" price={38990} />)
    expect(screen.getByText('Tekna')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest tests/StickyBar.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/configurator/StickyBar'`

- [ ] **Step 3: Create the component**

```tsx
// src/components/configurator/StickyBar.tsx
'use client'

interface StickyBarProps {
  versionName: string
  price: number
  onReserve: () => void
}

export default function StickyBar({ versionName, price, onReserve }: StickyBarProps) {
  const formattedPrice = price.toLocaleString('pt-PT')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10">
      {/* Desktop: single row */}
      <div className="hidden md:flex items-center justify-between h-16 px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">Nissan Leaf</span>
          <span className="text-white font-semibold">{versionName}</span>
        </div>
        <span className="text-white font-medium">€{formattedPrice}</span>
        <button
          onClick={onReserve}
          className="bg-white text-[#0A0A0A] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Reservar agora
        </button>
      </div>

      {/* Mobile: two rows */}
      <div className="flex md:hidden flex-col gap-2 px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-sm">{versionName}</span>
          <span className="text-white/80 text-sm">€{formattedPrice}</span>
        </div>
        <button
          onClick={onReserve}
          className="w-full bg-white text-[#0A0A0A] font-semibold text-sm py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Reservar agora
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest tests/StickyBar.test.tsx --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/configurator/StickyBar.tsx tests/StickyBar.test.tsx
git commit -m "feat: add StickyBar component with version, price, and CTA"
```

---

## Task 3: ImagePanel component

**Files:**
- Create: `src/components/configurator/ImagePanel.tsx`

This component has no testable pure logic (all visual/animation). Skip unit tests — visual review in browser is the test.

- [ ] **Step 1: Create the component**

```tsx
// src/components/configurator/ImagePanel.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { INTERIOR_IMAGES } from './configuradorData'

type ImageView = 'exterior' | 'interior'

interface ImagePanelProps {
  exteriorImageSrc: string
  view: ImageView
  onViewChange: (view: ImageView) => void
  slideIndex: number
  onSlideChange: (index: number) => void
}

const SLIDE_ANIM = { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' }

export default function ImagePanel({
  exteriorImageSrc,
  view,
  onViewChange,
  slideIndex,
  onSlideChange,
}: ImagePanelProps) {
  const [direction, setDirection] = useState(0)

  function goTo(index: number) {
    setDirection(index > slideIndex ? 1 : -1)
    onSlideChange(index)
  }

  function prev() {
    if (slideIndex > 0) goTo(slideIndex - 1)
  }

  function next() {
    if (slideIndex < INTERIOR_IMAGES.length - 1) goTo(slideIndex + 1)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0A0A]">

      {/* Exterior: crossfade on color change */}
      <AnimatePresence mode="wait">
        {view === 'exterior' && (
          <motion.div
            key={exteriorImageSrc}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={exteriorImageSrc}
              alt="Nissan Leaf — cor exterior"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interior: horizontal slide */}
      {view === 'interior' && (
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={slideIndex}
              custom={direction}
              className="absolute inset-0"
              variants={{
                enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_ANIM}
            >
              <Image
                src={INTERIOR_IMAGES[slideIndex]}
                alt={`Interior — imagem ${slideIndex + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            disabled={slideIndex === 0}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={slideIndex === INTERIOR_IMAGES.length - 1}
            aria-label="Próximo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-10">
            {INTERIOR_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para imagem ${i + 1}`}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === slideIndex ? 'bg-white w-5' : 'bg-white/40 w-[6px]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Exterior / Interior toggle pill */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1 z-10">
        {(['exterior', 'interior'] as ImageView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            aria-pressed={view === v}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
              view === v ? 'bg-white text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {v === 'exterior' ? 'Exterior' : 'Interior'}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/configurator/ImagePanel.tsx
git commit -m "feat: add ImagePanel with exterior crossfade and interior slider"
```

---

## Task 4: OptionsPanel component

**Files:**
- Create: `src/components/configurator/OptionsPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/configurator/OptionsPanel.tsx
'use client'
import { VERSIONS, EXTERIOR_COLORS, getVersionInclusions } from './configuradorData'

interface OptionsPanelProps {
  selectedVersionId: string
  selectedColorId: string
  onSelectVersion: (id: string) => void
  onSelectColor: (id: string) => void
}

export default function OptionsPanel({
  selectedVersionId,
  selectedColorId,
  onSelectVersion,
  onSelectColor,
}: OptionsPanelProps) {
  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[1]
  const inclusions = getVersionInclusions(selectedVersionId)
  const prevVersionName = VERSIONS[VERSIONS.findIndex(v => v.id === selectedVersionId) - 1]?.name

  return (
    <div className="px-8 py-12 space-y-10">

      {/* Heading */}
      <div>
        <p className="text-sm font-semibold text-[#86868b] uppercase tracking-wider mb-2">
          Configurador
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-[#0A0A0A] leading-tight">
          Escolhe a tua versão.
        </h2>
      </div>

      {/* 1. Version selector */}
      <div>
        <div
          role="tablist"
          className="grid grid-cols-3 gap-2"
        >
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === selectedVersionId}
              onClick={() => onSelectVersion(v.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center transition-colors ${
                v.id === selectedVersionId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
              }`}
            >
              <span className="font-semibold text-sm">{v.name}</span>
              <span className={`text-xs ${v.id === selectedVersionId ? 'text-white/60' : 'text-[#86868b]'}`}>
                €{v.price.toLocaleString('pt-PT')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Exterior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Cor exterior
        </p>
        <div
          role="radiogroup"
          aria-label="Cor exterior"
          className="space-y-1"
        >
          {EXTERIOR_COLORS.map((color) => (
            <button
              key={color.id}
              role="radio"
              aria-checked={color.id === selectedColorId}
              onClick={() => onSelectColor(color.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                color.id === selectedColorId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-50 text-[#0A0A0A] hover:bg-gray-100'
              }`}
            >
              {/* Swatch */}
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Cor interior
        </p>
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] text-white cursor-default">
          <span className="w-4 h-4 rounded-full flex-shrink-0 bg-[#1a1a1a] border border-white/20" />
          <span className="text-sm font-medium">Black</span>
        </div>
      </div>

      {/* 4. Inclusions */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          O que inclui
        </p>
        {prevVersionName && (
          <p className="text-sm text-[#86868b] mb-3">
            Tudo da versão {prevVersionName} +
          </p>
        )}
        <ul className="space-y-2">
          {inclusions.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
              <span className="text-green-600 font-semibold">✓</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Features — TODO: v2 */}

    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/configurator/OptionsPanel.tsx
git commit -m "feat: add OptionsPanel with version tabs, colour selector, and inclusions"
```

---

## Task 5: Configurador section — main component

**Files:**
- Create: `src/components/sections/Configurador.tsx`
- Create: `tests/Configurador.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/Configurador.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock framer-motion (same pattern as Hero.test.tsx)
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
    useReducedMotion: () => false,
  }
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    // eslint-disable-next-line @next/next/no-img-element
    React.createElement('img', { alt, ...props }),
}))

import Configurador from '@/components/sections/Configurador'

describe('Configurador', () => {
  it('renders with id="configurador"', () => {
    const { container } = render(<Configurador onSelectVersion={jest.fn()} />)
    expect(container.querySelector('#configurador')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getByText('Escolhe a tua versão.')).toBeInTheDocument()
  })

  it('renders all 3 version buttons', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getByText('Visia')).toBeInTheDocument()
    expect(screen.getByText('N-Connecta')).toBeInTheDocument()
    expect(screen.getByText('Tekna')).toBeInTheDocument()
  })

  it('calls onSelectVersion when a version tab is clicked', () => {
    const onSelectVersion = jest.fn()
    render(<Configurador onSelectVersion={onSelectVersion} />)
    fireEvent.click(screen.getByText('Tekna'))
    expect(onSelectVersion).toHaveBeenCalledWith('tekna')
  })

  it('renders the sticky bar with default version N-Connecta', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    // StickyBar renders version name — at least one instance
    expect(screen.getAllByText('N-Connecta').length).toBeGreaterThan(0)
  })

  it('renders the Reservar agora CTA button', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getByRole('button', { name: /reservar agora/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/sections/Configurador'`

- [ ] **Step 3: Create the main section component**

```tsx
// src/components/sections/Configurador.tsx
'use client'
import { useState } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import StickyBar from '@/components/configurator/StickyBar'
import { VERSIONS, EXTERIOR_COLORS } from '@/components/configurator/configuradorData'

interface ConfiguradorProps {
  onSelectVersion: (versionId: string) => void
}

export default function Configurador({ onSelectVersion }: ConfiguradorProps) {
  const [selectedVersionId, setSelectedVersionId] = useState('n-connecta')
  const [selectedColorId, setSelectedColorId] = useState('TURQUOISE')
  const [imageView, setImageView] = useState<'exterior' | 'interior'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)

  function handleVersionSelect(id: string) {
    setSelectedVersionId(id)
    onSelectVersion(id)
  }

  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[1]
  const activeColor = EXTERIOR_COLORS.find(c => c.id === selectedColorId) ?? EXTERIOR_COLORS[0]

  function handleReserve() {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="configurador" className="relative bg-white">

      {/* Two-column layout: sticky left + scrollable right */}
      <div className="flex flex-col md:flex-row">

        {/* Left — sticky image panel */}
        <div className="w-full md:w-[55%] h-[50vh] md:h-auto md:sticky md:top-0 md:self-start" style={{ height: undefined }}>
          <div className="h-[50vh] md:h-screen">
            <ImagePanel
              exteriorImageSrc={activeColor.imageSrc}
              view={imageView}
              onViewChange={setImageView}
              slideIndex={slideIndex}
              onSlideChange={setSlideIndex}
            />
          </div>
        </div>

        {/* Right — scrollable options */}
        <div className="w-full md:w-[45%]">
          <OptionsPanel
            selectedVersionId={selectedVersionId}
            selectedColorId={selectedColorId}
            onSelectVersion={handleVersionSelect}
            onSelectColor={setSelectedColorId}
          />
        </div>

      </div>

      {/* Sticky CTA bar */}
      <StickyBar
        versionName={activeVersion.name}
        price={activeVersion.price}
        onReserve={handleReserve}
      />

    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Configurador.tsx tests/Configurador.test.tsx
git commit -m "feat: add Configurador section — sticky two-panel mini-configurator"
```

---

## Task 6: Page integration

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/sections/VersionComparison.tsx`

- [ ] **Step 1: Update page.tsx**

In `src/app/page.tsx`:
1. Remove the import for `VersionComparison`.
2. Add import for `Configurador`.
3. Replace `<VersionComparison onSelectVersion={setSelectedVersion} />` with `<Configurador onSelectVersion={setSelectedVersion} />`.
4. Add `className="pb-24 md:pb-20"` to `<main>`.

The result should be:

```tsx
'use client'
import { useState } from 'react'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import CTASection from '@/components/sections/CTASection'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined)

  return (
    <main className="pb-24 md:pb-20">
      <Hero />
      <Highlights />
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurator />
      <Configurador onSelectVersion={setSelectedVersion} />
      <CTASection selectedVersion={selectedVersion} />
      <ClosingSection selectedVersion={selectedVersion} />
    </main>
  )
}
```

- [ ] **Step 2: Delete the old VersionComparison file**

```bash
git rm src/components/sections/VersionComparison.tsx
```

- [ ] **Step 3: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests PASS. No references to `VersionComparison` should remain.

- [ ] **Step 4: Verify the dev server renders correctly**

```bash
npm run dev
```

Open `http://localhost:3000` and scroll to the `#configurador` section. Verify:
- Left panel shows a Nissan Leaf exterior image
- Clicking a colour row crossfades to the correct image
- Clicking "Interior" toggles to the interior slider
- Clicking a version tab updates the sticky bar price
- Clicking "Reservar agora" scrolls to `#reservar`

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate Configurador section into page, remove VersionComparison"
```

---

## Full test run

- [ ] **Run the full test suite one final time**

```bash
npx jest --no-coverage
```

Expected: all tests PASS with no errors or warnings.
