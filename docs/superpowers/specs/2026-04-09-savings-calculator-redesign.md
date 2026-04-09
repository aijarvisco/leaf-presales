# Spec: Savings Calculator Redesign + Bottom-Sheet Modal

**Date:** 2026-04-09  
**Scope:** Replace the existing savings calculator modal with a bottom-sheet modal, a two-column calculator layout, and a new EV vs ICE savings formula.

---

## 1. Modal (`src/components/ui/Modal.tsx`)

Full rewrite. The existing center-scale modal is replaced entirely with a bottom-sheet that slides up from the bottom. This becomes the single modal pattern used site-wide (calculator, FAQs, etc.).

**Behaviour:**
- Renders via `createPortal` to `document.body` (consistent with `ContactDrawer` and `ReservationDrawer`)
- SSR guard: `mounted` state, returns `null` until client
- Body scroll locked while open
- Closes on: backdrop click, ESC key, close button

**Overlay:**
- `bg-black/60 backdrop-blur-sm` — matches `ReservationDrawer` exactly

**Panel:**
- White background (`bg-white`)
- Rounded top corners (`rounded-t-2xl`)
- Fixed to bottom, full width
- `max-h-[90vh]` with `overflow-y-auto` for tall content
- Framer Motion: `AnimatePresence` + `y: '100%' → y: 0` slide-up animation

**Close button:**
- `×` positioned top-right of panel
- Style: `text-[#0A0A0A]/40 hover:text-[#0A0A0A]` (matches `ReservationDrawer`)

**Props (unchanged):**
```ts
interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}
```

`AutonomiaSectionV2.tsx` requires no changes.

---

## 2. Savings Calculator (`src/components/forms/SavingsCalculator.tsx`)

Full rewrite. Two-column layout inside the modal.

### Left column — Inputs

Ordered top to bottom:

| Field | Type | Default | Step | Range | Unit |
|---|---|---|---|---|---|
| Distância percorrida anual | Stepper | 15 000 | 500 | 1 000 – 100 000 | km |
| *(EV cost box)* | Display | — | — | — | € |
| Custo da Eletricidade | Stepper | 0.15 | 0.01 | 0.05 – 0.50 | €/kWh |
| Consumo de energia | Static | 15 | — | — | kWh/100km |
| *(ICE cost box)* | Display | — | — | — | € |
| Custo do Combustível | Stepper | 1.90 | 0.05 | 0.50 – 3.00 | €/litro |
| Consumo de combustível | Stepper | 6.0 | 0.5 | 3 – 15 | l/100km |

- "Consumo de energia" is read-only — displays the Leaf's fixed constant (`LEAF_KWH_PER_100KM = 15`)
- Cost boxes show `ev_cost_year` (EV box) and `ice_cost_year` (ICE box) from the formula output, formatted in green for EV

**Stepper control anatomy:**
```
[−]   15.000 km   [+]
```
Bordered row, `−` and `+` buttons decrement/increment by step, clamped to range.

### Right column — Results

Top to bottom:
1. Title: "Calculador de Poupança"
2. Leaf image: `/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png` (Next.js `Image`)
3. Large annual savings: `annual_savings` formatted as `€X.XXX,XX`, displayed prominently in green
4. Two sub-stats side by side:
   - "Poupança Mensal" → `monthly_savings` formatted as `€X,XX`
   - "Poupança Km" → `savings_per_km` formatted as `€X.XXXX/km`

---

## 3. Savings Formula (`src/lib/savings.ts`)

Full rewrite. Pure function, no side effects.

### Constant

```ts
const LEAF_KWH_PER_100KM = 15
```

### Input type

```ts
interface EVSavingsInputs {
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
```

`ev_consumption_kwh_per_100km` is not an input — it uses `LEAF_KWH_PER_100KM`.

### Output type

```ts
interface EVSavingsResult {
  ev_cost_year: number       // 2dp
  ice_cost_year: number      // 2dp
  annual_savings: number     // 2dp
  monthly_savings: number    // 2dp
  savings_per_km: number     // 4dp
}
```

### Formulas

```
driving     = adjustment_factors.driving     ?? 1
temperature = adjustment_factors.temperature ?? 1
load        = adjustment_factors.load        ?? 1

adjusted_ev_consumption  = LEAF_KWH_PER_100KM * driving * temperature * load
adjusted_ice_consumption = ice_consumption_l_per_100km * driving * temperature * load

ev_cost_year  = (km_per_year / 100) * adjusted_ev_consumption  * ev_energy_price_per_kwh
ice_cost_year = (km_per_year / 100) * adjusted_ice_consumption * fuel_price_per_l

annual_savings  = ice_cost_year - ev_cost_year
monthly_savings = annual_savings / 12
savings_per_km  = annual_savings / km_per_year
```

### Guards

- `km_per_year === 0` → return all zeros
- All `adjustment_factors` default to `1` if missing or undefined

---

## 4. Types (`src/types/index.ts`)

Replace `SavingsInputs` and `SavingsResult` with `EVSavingsInputs` and `EVSavingsResult` as defined above. Remove the old types entirely.

---

## 5. Files changed

| File | Action |
|---|---|
| `src/components/ui/Modal.tsx` | Full rewrite — bottom-sheet |
| `src/components/forms/SavingsCalculator.tsx` | Full rewrite — new layout + formula inputs |
| `src/lib/savings.ts` | Full rewrite — EV vs ICE formula |
| `src/types/index.ts` | Replace savings types |

`src/components/sections/AutonomiaSectionV2.tsx` — **no changes required**.

---

## 6. Out of scope

- Adjustment factors (`driving`, `temperature`, `load`) are implemented in the formula function but **not exposed in the UI** — no controls for them in the calculator
- CO₂ calculation removed (not part of new spec)
- No new routes, API calls, or server-side changes
