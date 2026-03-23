# Design Spec: Configurador Section

**Date:** 2026-03-23
**Status:** Approved
**Replaces:** `VersionComparison` component (`src/components/sections/VersionComparison.tsx`)

---

## Overview

A mini-configurator section that lets the user explore the Nissan Leaf by version, exterior colour, and interior colour — while a sticky image panel shows the result in real time. The section uses `id="configurador"` and replaces the existing `VersionComparison` section in the page.

**The existing `Configurator.tsx` (360° viewer, `id="360view"`) is kept as-is.** The two components coexist: `Configurator.tsx` (English spelling, 360-view section) remains above, and the new `Configurador.tsx` (Portuguese spelling, mini-configurator) replaces `VersionComparison` below it.

---

## Layout

Two-column split on desktop (`md+`), stacked on mobile:

- **Left — 55% width**: sticky image panel (`position: sticky`, `top: 0`, `height: 100vh`). Image fills the panel edge-to-edge.
- **Right — 45% width**: scrollable config column. Taller than the viewport so it scrolls while the left panel stays locked.
- **Bottom bar**: fixed CTA bar, always visible at the bottom of the viewport.

The section outer wrapper has `min-h-screen` (practically taller due to the right column content).

**Mobile (below `md`):** Image panel stacks **above** the options panel at a fixed height of `50vh`. It is no longer sticky — it becomes a static image block. Options panel scrolls normally below it. The sticky CTA bar remains fixed at the bottom.

The Exterior/Interior toggle pill and, when in interior view, the slider arrows and dot pagination are all overlaid within the `50vh` image panel on mobile. The `50vh` height (~400px on typical phones) is sufficient for this. Arrows are positioned at the vertical centre of the image; dots are at the bottom.

---

## Page Padding

To prevent the sticky CTA bar from obscuring page content, add `pb-20` to `<main>` in `page.tsx` (applies on all breakpoints — the bar is always visible). On mobile the bar can grow taller; use `pb-24 md:pb-20` if the two-row mobile layout requires extra clearance.

The `StickyBar` uses `z-index: 50` (`z-50` in Tailwind). The existing Navbar (currently commented out in `layout.tsx`) should use `z-40` if re-enabled.

---

## Left Panel — `ImagePanel.tsx`

**Exterior view (default):**
- Displays the image for the currently selected exterior colour.
- Image path: `/images/exterior-colors/{COLOR_ID}.png` where `COLOR_ID` matches the key in `EXTERIOR_COLORS`.
- On colour change: crossfade transition via Framer Motion `AnimatePresence` (opacity: `0 → 1` on enter, `1 → 0` on exit, duration `0.4s`).

**Interior view:**
- Image slider using the 7 interior/lifestyle images listed in `INTERIOR_IMAGES`.
- Transition: horizontal slide (`translateX`) — same direction/easing as `ValuesSection` carousel (`type: 'tween', duration: 0.55, ease: 'easeInOut'`).
- Prev/next arrow buttons with `aria-label="Anterior"` / `aria-label="Próximo"` (consistent with `ValuesSection`). Arrows are disabled (opacity 30%) at the first/last slide.
- Dot pagination below (or overlaid at bottom of image). Active dot is wider (`w-5`) vs inactive (`w-[6px]`), same pattern as `ValuesSection`.

**Toggle pill:**
- Exterior / Interior toggle at bottom-centre of the panel.
- Style: `bg-black/40 backdrop-blur-sm rounded-full p-1` — same as existing `Configurator.tsx` toggle.
- Buttons: `px-5 py-2 rounded-full text-sm font-medium`. Active: `bg-white text-black`. Inactive: `text-white/70`.
- `aria-pressed` on each button.

---

## Right Panel — `OptionsPanel.tsx`

Scrollable column with `px-8 py-12` padding. Sections in order:

### Heading
- Eyebrow label: `"Configurador"` (small, muted)
- Headline: `"Escolhe a tua versão."`

### 1. Version Selector

Three tab buttons: `Visia`, `N-Connecta`, `Tekna`.

- Layout: horizontal row of three buttons, full-width, equal columns.
- Selected: dark background (`bg-[#0A0A0A] text-white`). Unselected: `bg-gray-100 text-[#0A0A0A]`.
- Price shown below each button name in smaller text.
- Default selected: `N-Connecta`.
- On selection: calls `onSelectVersion(versionId)` immediately (not deferred to CTA click), so `CTASection` and `ClosingSection` stay in sync.
- `role="tablist"` on the container, `role="tab"` + `aria-selected` on each button.

### 2. Exterior Colour

Label: `"Cor exterior"` (section heading).

Six rows, list style (as in the Lightship reference):
- Each row: colour dot swatch (16×16 circle, filled with the colour's representative hex) + colour name text.
- Selected row: dark background (`bg-[#0A0A0A]`, white text). Unselected: light background (`bg-gray-50`), hover: `bg-gray-100`.
- Clicking a row instantly triggers the crossfade in the left panel.
- Container: `role="radiogroup" aria-label="Cor exterior"`. Each row: `role="radio" aria-checked={selected}`.

**Colour data** (id must match filename exactly):

| ID | Display name | Swatch hex |
|---|---|---|
| `TURQUOISE` | Turquoise | `#4ABFBF` |
| `FUJI SUNSET RED` | Fuji Sunset Red | `#C0392B` |
| `PEARL WHITE` | Pearl White | `#F5F5F0` |
| `UNIVERSAL BLUE` | Universal Blue | `#2C4A8E` |
| `CERAMIC GREY` | Ceramic Grey | `#A8A8A0` |
| `SKYLINE GREY` | Skyline Grey | `#6B6B6B` |

**File note:** The file `UNIVERSAL BLUE .png` has a trailing space in the filename. Rename it to `UNIVERSAL BLUE.png` (no trailing space) as part of implementation. The `id` in the data array must match the renamed filename exactly.

Default selected: `TURQUOISE`.

### 3. Interior Colour

Label: `"Cor interior"` (section heading).

Single row — **Black** — displayed as selected, non-interactive. Visual treatment: same row style as colour rows, but no hover effect and `cursor-default`. No `role="radio"` needed (not interactive).

### 4. Inclusions

Label: `"O que inclui"` (section heading).

Flat checklist of features for the selected version. Data sourced from the `VERSIONS` array in `VersionComparison.tsx` (`features: Record<string, boolean>`).

**Incremental display logic:**
- For `Visia`: show all features where `value === true` with a `✓` checkmark.
- For `N-Connecta`: show a `"Tudo da versão anterior +"` note, then show only the features that are `true` in `N-Connecta` but `false` in `Visia` (the delta). Derive at render time by diffing the two `features` objects.
- For `Tekna`: same — show `"Tudo da versão N-Connecta +"` note, then show the delta vs. `N-Connecta`.

This avoids any changes to the existing data structure.

### 5. Features / Destaques

**Deferred to v2 — out of scope for this implementation.**

The distinction between "Inclusions" and "Features" is not yet clearly defined for the Nissan Leaf content. This section will be added in a follow-up once copy and imagery are confirmed. Reserve vertical space with a placeholder `TODO` comment in the component.

---

## Sticky CTA Bar — `StickyBar.tsx`

Fixed to the bottom of the viewport, full width. `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`, `z-50`.

**Desktop layout (single row):**
```
[ Nissan Leaf  {version name} ]   [ €{price} ]   ────   [ Reservar agora → ]
```
- Left: "Nissan Leaf" (muted) + selected version name (bold).
- Centre: selected version price, `toLocaleString('pt-PT')` formatted.
- Right: primary CTA button — `onClick` scrolls to `#reservar`.
- Style: `bg-[#0A0A0A]/95 backdrop-blur-md`, `h-16`, white text.

**Mobile layout (two rows, `h-auto py-3`):**
- Row 1: version name + price.
- Row 2: CTA button, full width.

Props:
```ts
interface StickyBarProps {
  versionName: string
  price: number
  onReserve: () => void
}
```

---

## State

All state lives in `Configurador.tsx` and is passed down as props.

**`Configurador` component props:**
```ts
interface ConfiguradorProps {
  onSelectVersion: (versionId: string) => void
}
```
The prop type uses `string` (not the internal union) to stay compatible with `page.tsx`'s `setSelectedVersion: Dispatch<SetStateAction<string | undefined>>`.

**Internal state:**

| State variable | Type | Default |
|---|---|---|
| `selectedVersion` | `'visia' \| 'n-connecta' \| 'tekna'` | `'n-connecta'` |
| `selectedColor` | `string` (color ID) | `'TURQUOISE'` |
| `imageView` | `'exterior' \| 'interior'` | `'exterior'` |
| `interiorSlideIndex` | `number` | `0` |

---

## Data

### `VERSIONS`
Reuse the array from `VersionComparison.tsx` directly (import or copy). No structural changes.

### `EXTERIOR_COLORS`
```ts
const EXTERIOR_COLORS = [
  { id: 'TURQUOISE',        name: 'Turquoise',        hex: '#4ABFBF' },
  { id: 'FUJI SUNSET RED',  name: 'Fuji Sunset Red',  hex: '#C0392B' },
  { id: 'PEARL WHITE',      name: 'Pearl White',      hex: '#F5F5F0' },
  { id: 'UNIVERSAL BLUE',   name: 'Universal Blue',   hex: '#2C4A8E' },
  { id: 'CERAMIC GREY',     name: 'Ceramic Grey',     hex: '#A8A8A0' },
  { id: 'SKYLINE GREY',     name: 'Skyline Grey',     hex: '#6B6B6B' },
]
// imageSrc: `/images/exterior-colors/${color.id}.png`
```

### `INTERIOR_IMAGES`

All 7 files are currently **untracked** in git (visible in `git status`). They must be committed as part of the implementation PR along with the exterior-color images.

```ts
const INTERIOR_IMAGES = [
  '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
  '/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg',
  '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
  '/images/889862-F275-25TDIEU_PZ1D_04_LO.jpg',
  '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
  '/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg',
  '/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg',
]
```

---

## Component Files

| File | Responsibility |
|---|---|
| `src/components/sections/Configurador.tsx` | Main section, owns all state, `id="configurador"` |
| `src/components/configurator/ImagePanel.tsx` | Left sticky viewer — exterior image crossfade + interior slider |
| `src/components/configurator/OptionsPanel.tsx` | Right scroll column — version tabs, colour rows, inclusions |
| `src/components/configurator/StickyBar.tsx` | Fixed bottom CTA bar |

Note: the existing directory is `src/components/configurator/` (English spelling — contains `Canvas360Viewer.tsx` and `ConfiguratorViewer.tsx`). New files are added to this same directory. The section component file uses Portuguese spelling (`Configurador.tsx`) but lives under `sections/`, not under `configurator/`.

---

## Page Integration

In `src/app/page.tsx`:
1. Replace `import VersionComparison` with `import Configurador from '@/components/sections/Configurador'`.
2. Replace `<VersionComparison onSelectVersion={setSelectedVersion} />` with `<Configurador onSelectVersion={setSelectedVersion} />`.
3. Add `pb-24 md:pb-20` to `<main>` to offset the sticky CTA bar.
4. All other sections (`CTASection`, `ClosingSection`) and the `selectedVersion` state wiring remain unchanged.

---

## Out of Scope

- Features/Destaques cards (deferred to v2).
- Multiple interior colours (currently only Black).
- Animated scroll-driven effects on the right panel.
- Price calculator or finance options.
- Real-time API data — all content is static.
