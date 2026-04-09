# Expandable CTA Bar

**Date:** 2026-04-09
**Status:** Approved

## Overview

Replace the single "Configurar" CTA in `BottomCTABar` with an expandable pill that has "Reservar agora" as the primary action and a chevron arrow that expands the bar to reveal two additional options: "Configurar Leaf" and "Ser Contactado".

## States

### Collapsed (default)

```
[ Nissan Leaf  Desde 29.900€          Reservar agora  ↑ ]
```

- Same pill shape (`rounded-full`), same dark background (`bg-[#3A3A3C]/95`)
- "Reservar agora" fires the reservation drawer (dispatches `reservationdrawer:open` or equivalent)
- Chevron arrow (↑) sits to the right of the main CTA, visually distinct

### Expanded

```
┌─────────────────────────────────────┐
│  Reservar agora                     │
│  Configurar Leaf                    │
│  Ser Contactado                     │
│                                  ↓  │
└─────────────────────────────────────┘
```

- Label row ("Nissan Leaf / Desde 29.900€") hidden
- Three stacked options visible
- Arrow flips to ↓; clicking it collapses the panel
- Clicking any option triggers its action and collapses the panel
- Clicking outside the panel collapses it

## Actions

| Option | Action |
|---|---|
| Reservar agora | Opens the reservation drawer |
| Configurar Leaf | Smooth scrolls to `#configurador` |
| Ser Contactado | Smooth scrolls to the info/contact form section |

## Animation & Motion

- **Expand:** `max-height` animates from pill height → full panel height (`duration-300 ease-in-out`)
- **Border radius:** transitions from `rounded-full` → `rounded-2xl` as the panel grows
- **Label row:** fades out (`opacity-0`) slightly before the options fade in (~100ms head start)
- **Options:** fade in top-to-bottom with ~50ms stagger between each
- **Arrow:** rotates 180° (`rotate-180`) in sync with expand/collapse
- **Collapse:** full reverse of the above
- **Implementation:** Pure Tailwind transitions + React `isExpanded` state — no Framer Motion needed

## Accessibility

- Arrow button has `aria-expanded` (true/false) toggled on state change
- Arrow button `aria-label` toggles between `"Ver mais opções"` and `"Fechar opções"`
- Each option button has a descriptive `aria-label`
- Options have `tabIndex={-1}` when panel is collapsed
- `Escape` key collapses the panel

## Edge Cases

- If the reservation drawer opens, the panel collapses first — existing `drawerOpen` logic still hides the whole bar
- `configuradorVisible` and `closingVisible` hide logic is unchanged — bar hides when those sections are in view
- Panel width stays `auto` on all screen sizes (content-driven, same as current pill)

## Files Affected

- `src/components/ui/BottomCTABar.tsx` — primary change, self-contained
