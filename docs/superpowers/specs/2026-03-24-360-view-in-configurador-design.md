# Design: Integrate 360° View into Configurador

**Date:** 2026-03-24
**Status:** Approved

---

## Goal

Retire the standalone `#360view` section and surface the 360° viewer directly inside the Configurador's left image panel, accessible via a "Vista 360" button alongside the existing Exterior/Interior toggle.

---

## UI States

### Default (exterior or interior active)

Bottom of the image panel shows two separate elements on the same row at `bottom-8`:

- **Left:** `[⊕ Vista 360]` — standalone pill button
- **Right:** `[Exterior | Interior]` — existing toggle pill (unchanged)

### 360 active

Both pills are replaced by:

- **Hint text** (centered, above button): `← Drag to explore →` — fades out after ~2s
- **Close button** (centered pill): `[Close]` — returns to exterior view

The left panel renders `Canvas360Viewer` filling the full area.

### Color swatch clicked while 360 is active

Auto-closes the 360 view and switches to `exterior` with the newly selected color. Handled in `Configurador`, no change to `OptionsPanel`.

---

## Architecture

### Type change

```ts
// Before
type ImageView = 'exterior' | 'interior'

// After
type ImageView = 'exterior' | 'interior' | '360'
```

### `ImagePanel.tsx`

- Accept the extended `ImageView` type (no new props — reuses existing `onViewChange`)
- When `view !== '360'`: render existing content + new `[⊕ Vista 360]` pill to the left of the `[Exterior | Interior]` pill
- When `view === '360'`:
  - Render `Canvas360Viewer` (fills panel via `absolute inset-0`)
  - Hide both pills
  - Show `← Drag to explore →` hint (auto-fades after ~2s via `setTimeout` + opacity transition)
  - Show centered `[Close]` pill — calls `onViewChange('exterior')`
- Vista 360 button calls `onViewChange('360')`

### `Configurador.tsx`

- `imageView` state already exists; now also accepts `'360'`
- Wrap color selection: if `imageView === '360'`, call `setImageView('exterior')` before `setSelectedColorId(id)`

### `Configurator.tsx` (standalone section)

- Add `hidden` class to the root `<section id="360view">` — component stays in tree for easy re-enable

### No changes to

`OptionsPanel`, `Canvas360Viewer`, `ConfiguratorViewer`, `configuradorData`, `page.tsx`

---

## Transitions & Animation

- Fade (`transition-opacity`) on `Canvas360Viewer` mount/unmount via `AnimatePresence` — consistent with existing glass-shimmer transition
- Drag hint fades out after 2s on first render of the 360 view

---

## Mobile

`Canvas360Viewer` uses `absolute inset-0 w-full h-full` — fills the `h-[50vh]` mobile container automatically. No mobile-specific changes needed.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/configurator/ImagePanel.tsx` | Extend view type, add Vista 360 button, 360 view state |
| `src/components/sections/Configurador.tsx` | Color-click auto-close side effect |
| `src/components/sections/Configurator.tsx` | Add `hidden` to root section |
