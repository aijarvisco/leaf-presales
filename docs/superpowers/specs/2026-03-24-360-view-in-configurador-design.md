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

`ImageView` is defined locally in `ImagePanel.tsx` and stays there. `Configurador.tsx` does not import the type — it uses string literals (`'exterior'`, `'interior'`, `'360'`) directly with `setImageView`, which React infers correctly from the `useState` initializer.

```ts
// In ImagePanel.tsx (local, unchanged location)
// Before
type ImageView = 'exterior' | 'interior'

// After
type ImageView = 'exterior' | 'interior' | '360'
```

### `ImagePanel.tsx`

- `onViewChange: (view: ImageView) => void` already accepts `'360'` once the type is extended — no new props needed
- When `view !== '360'`: render existing content + new `[⊕ Vista 360]` pill to the left of the `[Exterior | Interior]` pill. The existing interior dots sit at `bottom-24` and the pills at `bottom-8` — they already coexist in the current code, no layout change needed
- When `view === '360'`:
  - Render `Canvas360Viewer` (fills panel via `absolute inset-0`). `Canvas360Viewer` takes no props and shows a static set of 360° frames — it does not change per color selection
  - Wrap `Canvas360Viewer` in `<AnimatePresence>` inside `ImagePanel`, at the same nesting level as the glass overlay, with a fade `motion.div` (`initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`)
  - Hide both pills
  - Show `← Drag to explore →` hint as a Framer Motion `motion.div` (`initial={{ opacity: 1 }}`, `animate={{ opacity: 0 }}`, `transition={{ delay: 2, duration: 0.6 }}`). The fade starts automatically 2s after mount. Resets on each mount (i.e. re-entering 360 always shows the hint again). The hint is `pointer-events-none`
  - Show centered `[Close]` pill at `bottom-8` — calls `onViewChange('exterior')`
- Vista 360 button calls `onViewChange('360')`

### `Configurador.tsx`

- `imageView` state already exists; now also accepts `'360'`. `slideIndex` is preserved as-is when entering/exiting 360 — no reset needed
- Add a `handleColorSelect` wrapper and pass it as `onSelectColor` to `OptionsPanel` (no changes to `OptionsPanel` itself):
  ```ts
  function handleColorSelect(id: string) {
    if (imageView === '360') setImageView('exterior')
    setSelectedColorId(id)
  }
  ```

### `Configurator.tsx` (standalone section)

- Add `hidden` class to the root `<section id="360view">` — component stays in tree for easy re-enable

### No changes to

`OptionsPanel`, `Canvas360Viewer`, `ConfiguratorViewer`, `configuradorData`, `page.tsx`

---

## Transitions & Animation

- Fade (`transition-opacity`) on `Canvas360Viewer` mount/unmount via `AnimatePresence` — consistent with existing glass-shimmer transition
- Drag hint: Framer Motion `motion.div`, `animate={{ opacity: 0 }}`, `transition={{ delay: 2, duration: 0.6 }}`. Resets on each 360 mount (component remounts). The hint appears immediately on 360 activation and fades regardless of user interaction.

---

## Mobile

`Canvas360Viewer` uses `absolute inset-0 w-full h-full` — fills the `h-[50vh]` mobile container automatically. The hint text and Close button are overlaid at `bottom-8` center using `absolute` positioning with `z-10`, same pattern as existing interior dots and toggle pills. No mobile-specific layout changes needed.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/configurator/ImagePanel.tsx` | Extend view type, add Vista 360 button, 360 view state |
| `src/components/sections/Configurador.tsx` | Color-click auto-close side effect |
| `src/components/sections/Configurator.tsx` | Add `hidden` to root section |
