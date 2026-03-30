# Configurator Data — Design Spec

**Date:** 2026-03-30
**Source:** `docs/leaf_versions.xlsx`
**Branch:** feature/configurator-real-data

---

## Overview

Replace the placeholder data in the configurator (wrong version names, wrong prices) with the real Nissan Leaf lineup sourced from `docs/leaf_versions.xlsx`. This covers versions, pricing, color availability, and curated feature highlights.

---

## Data Schema

Rewrite `src/components/configurator/configuradorData.ts` with the following interfaces:

```ts
interface BatteryOption {
  kWh: 52 | 75
  price: number           // PVP (VAT-inclusive) from Excel
  commercialCode: string  // e.g. "LE52KEG20A---"
}

interface TrimLevel {
  id: 'engage' | 'advance' | 'evolve'
  name: string
  isPopular: boolean
  batteryOptions?: BatteryOption[]  // only present on Engage
  price?: number                    // fixed PVP for Advance and Evolve
  highlights: string[]              // curated incremental feature list
  availableColorIds: string[]       // IDs of colors valid for this trim
}

interface ColorOption {
  id: string
  name: string
  hex: string
  type: 'single-tone' | 'two-tone'
  colorCode: string   // Excel code (e.g. "QBE", "YBR")
  imageSrc: string    // /images/exterior-colors/<id>.png
}
```

**Helper:** `getEffectivePrice(trim: TrimLevel, batteryKwh?: 52 | 75): number`
Returns the correct PVP: uses the matching `batteryOptions` entry for Engage, or `trim.price` for Advance/Evolve.

**Old exports removed:** `VERSIONS`, `EXTERIOR_COLORS`, `getVersionInclusions`, `Version`, `ExteriorColor`, `InclusionItem`.
**New exports:** `TRIM_LEVELS`, `COLOR_OPTIONS`, `INTERIOR_IMAGES`, `getEffectivePrice`, `TrimLevel`, `ColorOption`, `BatteryOption`.

---

## Trim Levels & Pricing

| Trim | Battery | Commercial Code | PVP |
|------|---------|----------------|-----|
| Engage | 52 kWh | LE52KEG20A--- | €39,900 |
| Engage | 75 kWh | LE75KEG20A--- | €43,300 |
| Advance | 75 kWh | LE75KAD20AT-- | €49,100 |
| Evolve | 75 kWh | LE75KEV20AT-- | €51,600 |

Advance is marked `isPopular: true`.

---

## Colors

All colors are metalizada finish, PVP €750 (from Excel).

### Single-Tone (available for Engage only)

| ID | Name | Code | Hex |
|----|------|------|-----|
| PEARL_WHITE | Pearl White | QBE | #F5F5F0 |
| MIDNIGHT_BLACK | Midnight Black | GAT | #1A1A1A |
| SKYLINE_GREY | Skyline Grey | KAD | #6B6B6B |
| FUJI_SUNSET_RED | Fuji Sunset Red | NBV | #C0392B |

### Two-Tone / Black Roof (available for Advance and Evolve)

| ID | Name | Code | Hex |
|----|------|------|-----|
| PEARL_WHITE_BLACK_ROOF | Pearl White + Black Roof | XKJ | #F5F5F0 |
| CERAMIC_GREY_BLACK_ROOF | Ceramic Grey + Black Roof | XEX | #A8A8A0 |
| SKYLINE_GREY_BLACK_ROOF | Skyline Grey + Black Roof | GAQ | #6B6B6B |
| FUJI_SUNSET_RED_BLACK_ROOF | Fuji Sunset Red + Black Roof | YAU | #C0392B |
| UNIVERSAL_BLUE_BLACK_ROOF | Universal Blue + Black Roof | XHQ | #2C4A8E |
| TURQUOISE_BLACK_ROOF | Turquoise + Black Roof | YBR | #4ABFBF |

**Image dependency:** New assets needed for two-tone colors and Midnight Black under `/public/images/exterior-colors/`. Until provided, a placeholder image path is used.

---

## Curated Highlights

Highlights are incremental — each trim shows only what it adds.

### Engage
- Bateria 52 kWh ou 75 kWh
- Jantes de liga leve 18"
- Ecrã de infotenimento 12,3" + painel de instrumentos 12,3"
- Android Auto & Apple CarPlay
- ProPILOT Assist com Navi-link
- Travagem automática dianteira e traseira
- Bomba de calor + V2L + OBC 11 kW

### Advance *(adds on top of Engage)*
- Tejadilho panorâmico escurecido
- Head-up display 8"
- Ecrã de infotenimento 14,3" + painel 14,3"
- Bancos e volante aquecidos
- Carregador wireless 15W
- Serviços Google integrados (Maps, Assistente, Play)
- Porta da bagageira elétrica

### Evolve *(adds on top of Advance)*
- Jantes de liga leve 19"
- Banco de massagem do condutor
- Bancos elétricos de 8 regulações (condutor e passageiro)
- Sistema BOSE com subwoofer e 9 altifalantes

---

## Component Changes

### `configuradorData.ts`
Full rewrite. All data and interfaces replaced as described above. `INTERIOR_IMAGES` array is preserved unchanged.

### `Configurador.tsx`
- Rename `selectedVersionId` → `selectedTrimId` (type: `'engage' | 'advance' | 'evolve'`), default: `'engage'`
- Add `selectedBatteryKwh: 52 | 75` state (default: `75`); resets to `75` whenever the user switches back to Engage from another trim
- Replace `VERSIONS`/`EXTERIOR_COLORS` lookups with `TRIM_LEVELS`/`COLOR_OPTIONS`
- Pass `selectedBatteryKwh` and `onSelectBattery` to `OptionsPanel`
- Pass battery info to `ReservationDrawer` when trim is Engage

### `OptionsPanel.tsx`
- Trim selector: renders 3 cards (Engage, Advance, Evolve)
- Battery selector: pill buttons (52 kWh / 75 kWh), visible **only when Engage is selected**, defaults to 75 kWh
- Color picker: filters `COLOR_OPTIONS` by `trim.availableColorIds`; on trim change, snaps to first available color
- Highlights list: renders `trim.highlights` as a flat list

### No changes to
`ImagePanel`, `ReservationDrawer`, `StickyBar`, `Canvas360Viewer`, `ConfiguratorViewer`, `InteriorViewer`.

---

## Branch

All changes on `feature/configurator-real-data`, branched from `main`.
