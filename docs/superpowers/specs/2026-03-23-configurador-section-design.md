# Design Spec: Configurador Section

**Date:** 2026-03-23
**Status:** Approved
**Replaces:** `VersionComparison` component (`src/components/sections/VersionComparison.tsx`)

---

## Overview

A mini-configurator section that lets the user explore the Nissan Leaf by version, exterior colour, and interior colour — while a sticky image panel shows the result in real time. The section uses `id="configurador"` and replaces the existing `VersionComparison` section in the page.

---

## Layout

Two-column split on desktop (`md+`), stacked on mobile:

- **Left — 55% width**: sticky image panel (`position: sticky`, `top: 0`, `height: 100vh`). Image fills the panel edge-to-edge.
- **Right — 45% width**: scrollable config column. Taller than the viewport so it scrolls while the left panel stays locked.
- **Bottom bar**: fixed CTA bar, always visible at the bottom of the viewport.

The section outer wrapper has `min-h-screen` (practically taller due to the right column content).

---

## Left Panel — `ImagePanel.tsx`

**Exterior view (default):**
- Displays the image for the currently selected exterior colour from `/images/exterior-colors/<COLOR>.png`.
- On colour change: crossfade transition via Framer Motion `AnimatePresence` + `initial/animate/exit` opacity.

**Interior view:**
- Image slider using 5 existing lifestyle images from `/images/` (889857a, 889858a, 889861, 889862, 889866a).
- Prev/next arrow buttons + dot pagination. Same interaction model as `ValuesSection` carousel.

**Toggle pill:**
- Exterior / Interior toggle at bottom-centre of the panel.
- Same dark pill style (`bg-black/40 backdrop-blur-sm rounded-full`) as the existing 360° Configurator.
- Clicking switches the left panel between exterior image and interior slider.

---

## Right Panel — `OptionsPanel.tsx`

Scrollable column. Sections in order:

### Heading
- Eyebrow label: `"Configurador"`
- Headline: `"Escolhe a tua versão."`

### 1. Version Selector
- Three pill/tab buttons: `Visia`, `N-Connecta`, `Tekna`
- Price displayed below each button.
- Default selected: `N-Connecta`.
- Selecting a version updates: inclusions list, features list, and the CTA bar price.

### 2. Exterior Colour
- Label: `"Cor exterior"`
- Six rows (list style, as in Lightship reference): colour dot swatch + colour name.
- Colours:
  - Turquoise
  - Fuji Sunset Red
  - Pearl White
  - Universal Blue
  - Ceramic Grey
  - Skyline Grey
- Selected row: dark background / highlighted state.
- Selecting a row instantly crossfades the left panel image.
- Default: first colour (Turquoise).

### 3. Interior Colour
- Label: `"Cor interior"`
- Single row: **Black** — shown as selected, non-interactive (all versions and colours share this interior).

### 4. Inclusions
- Label: `"O que inclui"`
- Flat list of checkmark items for the selected version, using existing feature data from `VersionComparison`.
- Higher versions (N-Connecta, Tekna) prepend a `"Tudo da versão anterior +"` note before listing new additions.
- Data sourced from the `VERSIONS` array already defined in `VersionComparison.tsx`.

### 5. Features
- Label: `"Destaques"`
- 2–3 feature highlight cards per version: small image thumbnail + feature title + short description.
- Initial content uses existing feature descriptions; placeholder images acceptable for launch.

---

## Sticky CTA Bar — `StickyBar.tsx`

Fixed to the bottom of the viewport, full width.

```
[ Nissan Leaf  {version name} ]   [ €{price} ]   ────   [ Reservar agora → ]
```

- **Left**: "Nissan Leaf" + selected version name.
- **Centre-left**: selected version price, formatted as `€XX XXX` (Portuguese locale).
- **Right**: primary CTA button — scrolls to `#reservar` on click (same pattern as existing sections).
- **Style**: `bg-[#0A0A0A]/95 backdrop-blur` dark bar, matching the site's dark theme.

**Mobile layout**: version + price on one line, CTA button full-width below.

---

## State

All state lives in `Configurador.tsx` and is passed down as props:

| State variable | Type | Default |
|---|---|---|
| `selectedVersion` | `'visia' \| 'n-connecta' \| 'tekna'` | `'n-connecta'` |
| `selectedColor` | `string` (color key) | `'TURQUOISE'` |
| `imageView` | `'exterior' \| 'interior'` | `'exterior'` |
| `interiorSlideIndex` | `number` | `0` |

---

## Data

### `VERSIONS`
Reuse and expand the array from `VersionComparison.tsx`:

```ts
{ id, name, price, isPopular, features: Record<string, boolean> }
```

### `EXTERIOR_COLORS`
```ts
{ id: string, name: string, imageSrc: string }
// e.g. { id: 'TURQUOISE', name: 'Turquoise', imageSrc: '/images/exterior-colors/TURQUOISE.png' }
```

Note: `UNIVERSAL BLUE .png` has a trailing space in the filename — handle with encoded path or rename.

### `INTERIOR_COLORS`
```ts
[{ id: 'black', name: 'Black', imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg' }]
```

### `INTERIOR_IMAGES`
```ts
[
  '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
  '/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg',
  '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
  '/images/889862-F275-25TDIEU_PZ1D_04_LO.jpg',
  '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
]
```

---

## Component Files

| File | Responsibility |
|---|---|
| `src/components/sections/Configurador.tsx` | Main section, owns all state, section `id="configurador"` |
| `src/components/configurador/ImagePanel.tsx` | Left sticky viewer — exterior image crossfade + interior slider |
| `src/components/configurador/OptionsPanel.tsx` | Right scroll column — version tabs, colour rows, inclusions, features |
| `src/components/configurador/StickyBar.tsx` | Fixed bottom CTA bar |

---

## Page Integration

In `src/app/page.tsx`:
- Replace `<VersionComparison onSelectVersion={setSelectedVersion} />` with `<Configurador onSelectVersion={setSelectedVersion} />`.
- Import path: `@/components/sections/Configurador`.
- The `selectedVersion` state variable and `CTASection` / `ClosingSection` wiring remain unchanged.

---

## Out of Scope

- Animated scroll-driven effects on the right panel (can be added later).
- Multiple interior colours (currently only Black).
- Price calculator or finance options.
- Real-time API data — all content is static.
