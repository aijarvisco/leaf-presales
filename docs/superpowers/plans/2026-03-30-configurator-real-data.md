# Configurator Real Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder version/color/price data in the configurator with the real Nissan Leaf lineup from `docs/leaf_versions.xlsx`, adding battery selection for Engage and per-trim color filtering.

**Architecture:** Rewrite `configuradorData.ts` with a new domain-accurate schema (`TrimLevel`, `ColorOption`, `BatteryOption`), update `OptionsPanel.tsx` to render a battery pill selector (Engage only) and filter colors by trim, and update `Configurador.tsx` to manage the new battery state and wire it through.

**Tech Stack:** Next.js, React, TypeScript, Jest + Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/configurator/configuradorData.ts` | Rewrite | All data: trims, prices, colors, highlights, helper |
| `src/components/configurator/OptionsPanel.tsx` | Modify | Battery selector (Engage only), filtered color list, highlights |
| `src/components/sections/Configurador.tsx` | Modify | Battery state, trim-change side-effects, new prop names |
| `tests/components/configurator/configuradorData.test.ts` | Create | Unit tests for data shape and `getEffectivePrice` |
| `tests/components/configurator/OptionsPanel.test.tsx` | Create | Battery selector visibility, color filtering, highlights |
| `tests/Configurador.test.tsx` | Modify | Update version names, default color, battery selector smoke test |

---

## Task 1: Create feature branch

- [ ] **Step 1: Create and checkout the feature branch**

```bash
git checkout -b feature/configurator-real-data
```

Expected: `Switched to a new branch 'feature/configurator-real-data'`

---

## Task 2: Rewrite `configuradorData.ts`

**Files:**
- Rewrite: `src/components/configurator/configuradorData.ts`
- Create: `tests/components/configurator/configuradorData.test.ts`

- [ ] **Step 1: Create the test file**

Create `tests/components/configurator/configuradorData.test.ts`:

```ts
import {
  TRIM_LEVELS,
  COLOR_OPTIONS,
  getEffectivePrice,
  type TrimLevel,
} from '@/components/configurator/configuradorData'

describe('TRIM_LEVELS', () => {
  it('has exactly 3 trims', () => {
    expect(TRIM_LEVELS).toHaveLength(3)
  })

  it('trims have ids engage, advance, evolve in order', () => {
    expect(TRIM_LEVELS.map(t => t.id)).toEqual(['engage', 'advance', 'evolve'])
  })

  it('only Engage has batteryOptions', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    expect(engage.batteryOptions).toBeDefined()
    expect(advance.batteryOptions).toBeUndefined()
    expect(evolve.batteryOptions).toBeUndefined()
  })

  it('Engage has 52 kWh and 75 kWh battery options', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    expect(engage.batteryOptions!.map(b => b.kWh)).toEqual([52, 75])
  })

  it('Advance and Evolve have a fixed price', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    expect(advance.price).toBe(49100)
    expect(evolve.price).toBe(51600)
  })

  it('Advance is marked isPopular', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    expect(advance.isPopular).toBe(true)
  })

  it('each trim has at least one highlight', () => {
    TRIM_LEVELS.forEach(t => {
      expect(t.highlights.length).toBeGreaterThan(0)
    })
  })

  it('each trim has at least one availableColorId', () => {
    TRIM_LEVELS.forEach(t => {
      expect(t.availableColorIds.length).toBeGreaterThan(0)
    })
  })

  it('Engage colors are single-tone only', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    engage.availableColorIds.forEach(id => {
      const color = COLOR_OPTIONS.find(c => c.id === id)!
      expect(color.type).toBe('single-tone')
    })
  })

  it('Advance and Evolve colors are two-tone only', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    ;[...advance.availableColorIds, ...evolve.availableColorIds].forEach(id => {
      const color = COLOR_OPTIONS.find(c => c.id === id)!
      expect(color.type).toBe('two-tone')
    })
  })
})

describe('COLOR_OPTIONS', () => {
  it('has 10 colors total (4 single-tone + 6 two-tone)', () => {
    const singleTone = COLOR_OPTIONS.filter(c => c.type === 'single-tone')
    const twoTone    = COLOR_OPTIONS.filter(c => c.type === 'two-tone')
    expect(singleTone).toHaveLength(4)
    expect(twoTone).toHaveLength(6)
  })

  it('every color has id, name, hex, colorCode, imageSrc', () => {
    COLOR_OPTIONS.forEach(c => {
      expect(c.id).toBeTruthy()
      expect(c.name).toBeTruthy()
      expect(c.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(c.colorCode).toBeTruthy()
      expect(c.imageSrc).toMatch(/^\/images\//)
    })
  })
})

describe('getEffectivePrice', () => {
  const engage = TRIM_LEVELS.find(t => t.id === 'engage')! as TrimLevel
  const advance = TRIM_LEVELS.find(t => t.id === 'advance')! as TrimLevel
  const evolve  = TRIM_LEVELS.find(t => t.id === 'evolve')!  as TrimLevel

  it('returns 39900 for Engage 52 kWh', () => {
    expect(getEffectivePrice(engage, 52)).toBe(39900)
  })

  it('returns 43300 for Engage 75 kWh', () => {
    expect(getEffectivePrice(engage, 75)).toBe(43300)
  })

  it('defaults to 75 kWh when batteryKwh is omitted for Engage', () => {
    expect(getEffectivePrice(engage)).toBe(43300)
  })

  it('returns 49100 for Advance', () => {
    expect(getEffectivePrice(advance)).toBe(49100)
  })

  it('returns 51600 for Evolve', () => {
    expect(getEffectivePrice(evolve)).toBe(51600)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest tests/components/configurator/configuradorData.test.ts --no-coverage
```

Expected: Tests fail because `TRIM_LEVELS`, `COLOR_OPTIONS`, `getEffectivePrice` don't exist yet.

- [ ] **Step 3: Rewrite `configuradorData.ts`**

Replace the full contents of `src/components/configurator/configuradorData.ts`:

```ts
export interface BatteryOption {
  kWh: 52 | 75
  price: number
  commercialCode: string
}

export interface TrimLevel {
  id: 'engage' | 'advance' | 'evolve'
  name: string
  isPopular: boolean
  batteryOptions?: BatteryOption[]
  price?: number
  highlights: string[]
  availableColorIds: string[]
}

export interface ColorOption {
  id: string
  name: string
  hex: string
  type: 'single-tone' | 'two-tone'
  colorCode: string
  imageSrc: string
}

export const TRIM_LEVELS: TrimLevel[] = [
  {
    id: 'engage',
    name: 'Engage',
    isPopular: false,
    batteryOptions: [
      { kWh: 52, price: 39900, commercialCode: 'LE52KEG20A---' },
      { kWh: 75, price: 43300, commercialCode: 'LE75KEG20A---' },
    ],
    highlights: [
      'Bateria 52 kWh ou 75 kWh',
      'Jantes de liga leve 18"',
      'Ecrã de infotenimento 12,3" + painel de instrumentos 12,3"',
      'Android Auto & Apple CarPlay',
      'ProPILOT Assist com Navi-link',
      'Travagem automática dianteira e traseira',
      'Bomba de calor + V2L + OBC 11 kW',
    ],
    availableColorIds: ['PEARL_WHITE', 'MIDNIGHT_BLACK', 'SKYLINE_GREY', 'FUJI_SUNSET_RED'],
  },
  {
    id: 'advance',
    name: 'Advance',
    isPopular: true,
    price: 49100,
    highlights: [
      'Tejadilho panorâmico escurecido',
      'Head-up display 8"',
      'Ecrã de infotenimento 14,3" + painel 14,3"',
      'Bancos e volante aquecidos',
      'Carregador wireless 15W',
      'Serviços Google integrados (Maps, Assistente, Play)',
      'Porta da bagageira elétrica',
    ],
    availableColorIds: [
      'PEARL_WHITE_BLACK_ROOF',
      'CERAMIC_GREY_BLACK_ROOF',
      'SKYLINE_GREY_BLACK_ROOF',
      'FUJI_SUNSET_RED_BLACK_ROOF',
      'UNIVERSAL_BLUE_BLACK_ROOF',
      'TURQUOISE_BLACK_ROOF',
    ],
  },
  {
    id: 'evolve',
    name: 'Evolve',
    isPopular: false,
    price: 51600,
    highlights: [
      'Jantes de liga leve 19"',
      'Banco de massagem do condutor',
      'Bancos elétricos de 8 regulações (condutor e passageiro)',
      'Sistema BOSE com subwoofer e 9 altifalantes',
    ],
    availableColorIds: [
      'PEARL_WHITE_BLACK_ROOF',
      'CERAMIC_GREY_BLACK_ROOF',
      'SKYLINE_GREY_BLACK_ROOF',
      'FUJI_SUNSET_RED_BLACK_ROOF',
      'UNIVERSAL_BLUE_BLACK_ROOF',
      'TURQUOISE_BLACK_ROOF',
    ],
  },
]

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'PEARL_WHITE',                name: 'Pearl White',                hex: '#F5F5F0', type: 'single-tone', colorCode: 'QBE', imageSrc: '/images/exterior-colors/PEARL_WHITE.png' },
  { id: 'MIDNIGHT_BLACK',             name: 'Midnight Black',             hex: '#1A1A1A', type: 'single-tone', colorCode: 'GAT', imageSrc: '/images/exterior-colors/MIDNIGHT_BLACK.png' },
  { id: 'SKYLINE_GREY',               name: 'Skyline Grey',               hex: '#6B6B6B', type: 'single-tone', colorCode: 'KAD', imageSrc: '/images/exterior-colors/SKYLINE_GREY.png' },
  { id: 'FUJI_SUNSET_RED',            name: 'Fuji Sunset Red',            hex: '#C0392B', type: 'single-tone', colorCode: 'NBV', imageSrc: '/images/exterior-colors/FUJI_SUNSET_RED.png' },
  { id: 'PEARL_WHITE_BLACK_ROOF',     name: 'Pearl White + Black Roof',   hex: '#F5F5F0', type: 'two-tone',   colorCode: 'XKJ', imageSrc: '/images/exterior-colors/PEARL_WHITE_BLACK_ROOF.png' },
  { id: 'CERAMIC_GREY_BLACK_ROOF',    name: 'Ceramic Grey + Black Roof',  hex: '#A8A8A0', type: 'two-tone',   colorCode: 'XEX', imageSrc: '/images/exterior-colors/CERAMIC_GREY_BLACK_ROOF.png' },
  { id: 'SKYLINE_GREY_BLACK_ROOF',    name: 'Skyline Grey + Black Roof',  hex: '#6B6B6B', type: 'two-tone',   colorCode: 'GAQ', imageSrc: '/images/exterior-colors/SKYLINE_GREY_BLACK_ROOF.png' },
  { id: 'FUJI_SUNSET_RED_BLACK_ROOF', name: 'Fuji Sunset Red + Black Roof', hex: '#C0392B', type: 'two-tone', colorCode: 'YAU', imageSrc: '/images/exterior-colors/FUJI_SUNSET_RED_BLACK_ROOF.png' },
  { id: 'UNIVERSAL_BLUE_BLACK_ROOF',  name: 'Universal Blue + Black Roof', hex: '#2C4A8E', type: 'two-tone', colorCode: 'XHQ', imageSrc: '/images/exterior-colors/UNIVERSAL_BLUE_BLACK_ROOF.png' },
  { id: 'TURQUOISE_BLACK_ROOF',       name: 'Turquoise + Black Roof',     hex: '#4ABFBF', type: 'two-tone',   colorCode: 'YBR', imageSrc: '/images/exterior-colors/TURQUOISE_BLACK_ROOF.png' },
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

export function getEffectivePrice(trim: TrimLevel, batteryKwh?: 52 | 75): number {
  if (trim.batteryOptions) {
    const opt = trim.batteryOptions.find(b => b.kWh === (batteryKwh ?? 75))
    return opt?.price ?? trim.batteryOptions[trim.batteryOptions.length - 1].price
  }
  return trim.price!
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx jest tests/components/configurator/configuradorData.test.ts --no-coverage
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/configurator/configuradorData.ts tests/components/configurator/configuradorData.test.ts
git commit -m "feat: rewrite configuradorData with real Leaf lineup data"
```

---

## Task 3: Update `OptionsPanel.tsx`

**Files:**
- Modify: `src/components/configurator/OptionsPanel.tsx`
- Create: `tests/components/configurator/OptionsPanel.test.tsx`

- [ ] **Step 1: Create failing tests for OptionsPanel**

Create `tests/components/configurator/OptionsPanel.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import OptionsPanel from '@/components/configurator/OptionsPanel'

const defaultProps = {
  selectedTrimId: 'engage',
  selectedColorId: 'PEARL_WHITE',
  selectedBatteryKwh: 75 as 52 | 75,
  onSelectTrim: jest.fn(),
  onSelectColor: jest.fn(),
  onSelectBattery: jest.fn(),
}

describe('OptionsPanel — trim selector', () => {
  it('renders 3 trim buttons: Engage, Advance, Evolve', () => {
    render(<OptionsPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /engage/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /evolve/i })).toBeInTheDocument()
  })

  it('marks the selected trim as aria-selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByRole('tab', { name: /advance/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /engage/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onSelectTrim with the correct id when a trim is clicked', () => {
    const onSelectTrim = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectTrim={onSelectTrim} />)
    fireEvent.click(screen.getByRole('tab', { name: /evolve/i }))
    expect(onSelectTrim).toHaveBeenCalledWith('evolve')
  })
})

describe('OptionsPanel — battery selector', () => {
  it('shows battery selector when Engage is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" />)
    expect(screen.getByText('52 kWh')).toBeInTheDocument()
    expect(screen.getByText('75 kWh')).toBeInTheDocument()
  })

  it('hides battery selector when Advance is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.queryByText('52 kWh')).not.toBeInTheDocument()
    expect(screen.queryByText('75 kWh')).not.toBeInTheDocument()
  })

  it('hides battery selector when Evolve is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="evolve" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.queryByText('52 kWh')).not.toBeInTheDocument()
  })

  it('calls onSelectBattery when a battery option is clicked', () => {
    const onSelectBattery = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectBattery={onSelectBattery} />)
    fireEvent.click(screen.getByText('52 kWh'))
    expect(onSelectBattery).toHaveBeenCalledWith(52)
  })
})

describe('OptionsPanel — color filtering', () => {
  it('shows only single-tone colors for Engage', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" selectedColorId="PEARL_WHITE" />)
    expect(screen.getByRole('radio', { name: /pearl white$/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /midnight black/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /skyline grey$/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /fuji sunset red$/i })).toBeInTheDocument()
    // Two-tone must NOT appear
    expect(screen.queryByRole('radio', { name: /black roof/i })).not.toBeInTheDocument()
  })

  it('shows only two-tone colors for Advance', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getAllByRole('radio', { name: /black roof/i }).length).toBe(6)
    // Single-tone must NOT appear
    expect(screen.queryByRole('radio', { name: /midnight black/i })).not.toBeInTheDocument()
  })

  it('calls onSelectColor when a color is clicked', () => {
    const onSelectColor = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectColor={onSelectColor} />)
    fireEvent.click(screen.getByRole('radio', { name: /midnight black/i }))
    expect(onSelectColor).toHaveBeenCalledWith('MIDNIGHT_BLACK')
  })
})

describe('OptionsPanel — highlights', () => {
  it('renders Engage highlights', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" />)
    expect(screen.getByText('ProPILOT Assist com Navi-link')).toBeInTheDocument()
  })

  it('renders Advance highlights with "Tudo da versão Engage +" header', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByText(/tudo da versão engage/i)).toBeInTheDocument()
    expect(screen.getByText('Tejadilho panorâmico escurecido')).toBeInTheDocument()
  })

  it('renders Evolve highlights with "Tudo da versão Advance +" header', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="evolve" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByText(/tudo da versão advance/i)).toBeInTheDocument()
    expect(screen.getByText('Jantes de liga leve 19"')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx jest tests/components/configurator/OptionsPanel.test.tsx --no-coverage
```

Expected: Tests fail because `OptionsPanel` still uses old props (`selectedVersionId`, `onSelectVersion`).

- [ ] **Step 3: Rewrite `OptionsPanel.tsx`**

Replace the full contents of `src/components/configurator/OptionsPanel.tsx`:

```tsx
'use client'
import { TRIM_LEVELS, COLOR_OPTIONS, getEffectivePrice } from './configuradorData'

interface OptionsPanelProps {
  selectedTrimId: string
  selectedColorId: string
  selectedBatteryKwh: 52 | 75
  onSelectTrim: (id: string) => void
  onSelectColor: (id: string) => void
  onSelectBattery: (kWh: 52 | 75) => void
}

export default function OptionsPanel({
  selectedTrimId,
  selectedColorId,
  selectedBatteryKwh,
  onSelectTrim,
  onSelectColor,
  onSelectBattery,
}: OptionsPanelProps) {
  const activeTrim    = TRIM_LEVELS.find(t => t.id === selectedTrimId) ?? TRIM_LEVELS[0]
  const availableColors = COLOR_OPTIONS.filter(c => activeTrim.availableColorIds.includes(c.id))
  const trimIndex     = TRIM_LEVELS.findIndex(t => t.id === selectedTrimId)
  const prevTrimName  = trimIndex > 0 ? TRIM_LEVELS[trimIndex - 1].name : null

  return (
    <div className="px-8 py-12 space-y-10">

      {/* Heading */}
      <div className="flex flex-col items-center text-center">
        <p className="leading-none text-3xl font-medium tracking-[-0.07em] text-[#0A0A0A]/60">
          Configurador
        </p>
        <h2 className="text-3xl md:text-4xl font-medium tracking-[-0.07em] leading-none text-[#0A0A0A]">
          Escolhe a tua versão.
        </h2>
      </div>

      {/* 1. Trim selector */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Versões
        </p>
        <div role="tablist" className="grid grid-cols-3 gap-2">
          {TRIM_LEVELS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === selectedTrimId}
              onClick={() => onSelectTrim(t.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center transition-colors ${
                t.id === selectedTrimId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
              }`}
            >
              <span className="font-semibold text-sm">{t.name}</span>
              <span className={`text-xs ${t.id === selectedTrimId ? 'text-white/60' : 'text-[#86868b]'}`}>
                €{getEffectivePrice(t, t.id === 'engage' ? selectedBatteryKwh : undefined).toLocaleString('pt-PT')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Battery selector — Engage only */}
      {activeTrim.id === 'engage' && activeTrim.batteryOptions && (
        <div>
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
            Bateria
          </p>
          <div className="flex gap-2">
            {activeTrim.batteryOptions.map((opt) => (
              <button
                key={opt.kWh}
                onClick={() => onSelectBattery(opt.kWh)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
                  opt.kWh === selectedBatteryKwh
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
                }`}
              >
                {opt.kWh} kWh
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Exterior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Exterior
        </p>
        <div
          role="radiogroup"
          aria-label="Cor exterior"
          className="space-y-1"
        >
          {availableColors.map((color) => (
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
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Interior colour — hardcoded, single option */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Interior
        </p>
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] text-white cursor-default">
          <span className="w-4 h-4 rounded-full flex-shrink-0 bg-[#1a1a1a] border border-white/20" />
          <span className="text-sm font-medium">Black</span>
        </div>
      </div>

      {/* 5. Highlights */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Incluído
        </p>
        {prevTrimName && (
          <p className="text-sm text-[#86868b] mb-3">
            Tudo da versão {prevTrimName} +
          </p>
        )}
        <ul className="space-y-2">
          {activeTrim.highlights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
              <span className="text-green-600 font-semibold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
```

- [ ] **Step 4: Run OptionsPanel tests — expect pass**

```bash
npx jest tests/components/configurator/OptionsPanel.test.tsx --no-coverage
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/configurator/OptionsPanel.tsx tests/components/configurator/OptionsPanel.test.tsx
git commit -m "feat: update OptionsPanel with battery selector and per-trim color filtering"
```

---

## Task 4: Update `Configurador.tsx` and fix existing tests

**Files:**
- Modify: `src/components/sections/Configurador.tsx`
- Modify: `tests/Configurador.test.tsx`

- [ ] **Step 1: Update `Configurador.tsx`**

Replace the state block and all references to old exports. Full updated file:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import ReservationDrawer from '@/components/ui/ReservationDrawer'
import { TRIM_LEVELS, COLOR_OPTIONS, getEffectivePrice } from '@/components/configurator/configuradorData'

export default function Configurador() {
  const [selectedTrimId, setSelectedTrimId] = useState<'engage' | 'advance' | 'evolve'>('engage')
  const [selectedBatteryKwh, setSelectedBatteryKwh] = useState<52 | 75>(75)
  const [selectedColorId, setSelectedColorId] = useState('PEARL_WHITE')
  const [imageView, setImageView] = useState<'exterior' | 'interior' | '360'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const sectionRef  = useRef<HTMLElement>(null)
  const clipRef     = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const overflowRef = useRef(0)

  function handleTrimSelect(id: string) {
    const newTrim = TRIM_LEVELS.find(t => t.id === id)
    if (!newTrim) return
    setSelectedTrimId(id as 'engage' | 'advance' | 'evolve')
    setSelectedBatteryKwh(75)
    setSelectedColorId(newTrim.availableColorIds[0])
  }

  function handleColorSelect(id: string) {
    if (imageView === '360') setImageView('exterior')
    setSelectedColorId(id)
  }

  function handleBatterySelect(kWh: 52 | 75) {
    setSelectedBatteryKwh(kWh)
  }

  const activeTrim   = TRIM_LEVELS.find(t => t.id === selectedTrimId) ?? TRIM_LEVELS[0]
  const activeColor  = COLOR_OPTIONS.find(c => c.id === selectedColorId) ?? COLOR_OPTIONS[0]
  const effectivePrice = getEffectivePrice(activeTrim, selectedBatteryKwh)

  function handleReserve() {
    setIsDrawerOpen(true)
  }

  useEffect(() => {
    const section = sectionRef.current
    const clip    = clipRef.current
    const content = contentRef.current
    if (!section || !clip || !content) return

    function measure() {
      if (window.innerWidth < 768) {
        section!.style.height = ''
        content!.style.transform = ''
        overflowRef.current = 0
        return
      }
      const overflow = Math.max(0, content!.scrollHeight - clip!.clientHeight)
      overflowRef.current = overflow
      section!.style.height = `calc(100vh + ${overflow}px)`
      onScroll()
    }

    function onScroll() {
      if (window.innerWidth < 768) return
      const scrolledIn = Math.max(0, -section!.getBoundingClientRect().top)
      const clamped    = Math.min(scrolledIn, overflowRef.current)
      content!.style.transform = `translateY(-${clamped}px)`
    }

    const ro = new ResizeObserver(measure)
    ro.observe(content)
    measure()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(
      isDrawerOpen ? 'reservationdrawer:open' : 'reservationdrawer:close'
    ))
  }, [isDrawerOpen])

  return (
    <section ref={sectionRef} id="configurador" className="relative bg-white">

      <div className="overflow-hidden flex flex-col md:flex-row md:sticky md:top-0 md:h-screen">

        <div className="w-full md:w-[65%] h-[50vh] md:h-full">
          <ImagePanel
            exteriorImageSrc={activeColor.imageSrc}
            view={imageView}
            onViewChange={setImageView}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        </div>

        <div className="w-full md:w-[35%] md:h-full flex flex-col">

          <div ref={clipRef} className="flex-1 overflow-hidden relative">
            <div ref={contentRef} className="md:absolute md:top-0 md:left-0 md:right-0 md:will-change-transform">
              <OptionsPanel
                selectedTrimId={selectedTrimId}
                selectedColorId={selectedColorId}
                selectedBatteryKwh={selectedBatteryKwh}
                onSelectTrim={handleTrimSelect}
                onSelectColor={handleColorSelect}
                onSelectBattery={handleBatterySelect}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white px-8 py-5">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-[#86868b]">Nissan Leaf {activeTrim.name}</span>
                <span className="text-lg font-semibold text-[#0A0A0A]">
                  €{effectivePrice.toLocaleString('pt-PT')}
                </span>
              </div>
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A0A0A]">{activeTrim.name}</span>
                <span className="text-sm text-[#86868b]">€{effectivePrice.toLocaleString('pt-PT')}</span>
              </div>
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>
          </div>

        </div>
      </div>

      <ReservationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        versionId={activeTrim.id}
        versionName={activeTrim.name}
        colorName={activeColor.name}
        colorHex={activeColor.hex}
        colorImageSrc={activeColor.imageSrc}
        price={effectivePrice}
      />
    </section>
  )
}
```

- [ ] **Step 2: Update `tests/Configurador.test.tsx`**

The existing tests reference old version names (`Visia`, `N-Connecta`, `Tekna`) and old color IDs. Update these tests:

Replace the `'renders all 3 version buttons'` test:
```tsx
it('renders all 3 version buttons', () => {
  render(<Configurador />)
  expect(screen.getByRole('tab', { name: /engage/i })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /advance/i })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /evolve/i })).toBeInTheDocument()
})
```

Replace the `'renders the sticky bar with default version N-Connecta'` test:
```tsx
it('renders the CTA bar with default version Engage', () => {
  render(<Configurador />)
  expect(screen.getAllByText(/engage/i).length).toBeGreaterThan(0)
})
```

Replace the `'clicking a color while in 360 view closes the 360 viewer'` test (default color is now `PEARL_WHITE`, click `MIDNIGHT_BLACK` instead):
```tsx
it('clicking a color while in 360 view closes the 360 viewer', () => {
  render(<Configurador />)
  fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
  expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('radio', { name: /midnight black/i }))
  expect(screen.queryByTestId('canvas-360-viewer')).not.toBeInTheDocument()
})
```

- [ ] **Step 3: Run all Configurador tests — expect pass**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Configurador.tsx tests/Configurador.test.tsx
git commit -m "feat: update Configurador state for trim/battery model and new data exports"
```

---

## Task 5: Final test run and image placeholder note

- [ ] **Step 1: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass. If any test references `VERSIONS`, `EXTERIOR_COLORS`, or `getVersionInclusions` from `configuradorData`, update that test file to use the new exports (`TRIM_LEVELS`, `COLOR_OPTIONS`, `getEffectivePrice`). Note: `tests/components/sections/Configurator.test.tsx` is the unused English version of the configurator — if it fails due to the data changes, update or skip those tests similarly.

- [ ] **Step 2: Note on missing image assets**

The following image files are referenced in `COLOR_OPTIONS` but do not yet exist in `/public/images/exterior-colors/`. The configurator will render broken `<img>` tags for these colors until the assets are provided. No code change is needed — just document the pending assets:

```
PEARL_WHITE.png            (rename from existing PEARL WHITE.png if present)
MIDNIGHT_BLACK.png         (new)
SKYLINE_GREY.png           (rename from existing SKYLINE GREY.png if present)
FUJI_SUNSET_RED.png        (rename from existing FUJI SUNSET RED.png if present)
PEARL_WHITE_BLACK_ROOF.png (new)
CERAMIC_GREY_BLACK_ROOF.png (new)
SKYLINE_GREY_BLACK_ROOF.png (new)
FUJI_SUNSET_RED_BLACK_ROOF.png (new)
UNIVERSAL_BLUE_BLACK_ROOF.png  (new)
TURQUOISE_BLACK_ROOF.png   (new)
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup — all configurator tests passing"
```
