# Bottom CTA Bar — Design Spec

**Date:** 2026-03-27
**Status:** Approved

---

## Overview

A globally persistent bottom bar that prompts users to configure the Nissan Leaf. It is visible throughout the page scroll but hides automatically when the Configurador or Closing sections are in view, avoiding duplication with those sections' own CTAs.

---

## Component

**File:** `src/components/ui/BottomCTABar.tsx`

Self-contained client component. No props — all copy and behavior are static.

---

## Layout

- `fixed bottom-0 left-0 right-0 z-40` (one level below `SiteHeader` at z-50)
- Background: `bg-[#1C1C1E]` with `border-t border-white/10`
- Single horizontal row on all breakpoints
- **Left:** `"Nissan Leaf"` in white semibold + `"/ Entregas previstas em Maio"` in `text-white/50`
- **Right:** `"Configurar"` button, `bg-[#E8372F]` (brand red, matches `ClosingSection`), `rounded-full`, scrolls to `#configurador` on click

---

## Visibility Logic

Two `IntersectionObserver` instances watch:

1. `#configurador` — the Configurador section (already has this id)
2. `#closing` — the ClosingSection `<section>` element (add this id to `ClosingSection.tsx`)

When either section is intersecting the viewport, the bar translates off-screen (`translate-y-full`). When neither is intersecting, it slides back into view. Animated with `transition-transform duration-300`.

State: a single `hidden` boolean derived from `configuradorVisible || closingVisible`.

---

## Changes Required

| File | Change |
|------|--------|
| `src/components/ui/BottomCTABar.tsx` | Create new component |
| `src/components/sections/ClosingSection.tsx` | Add `id="closing"` to the outer `<section>` |
| `src/app/page.tsx` | Mount `<BottomCTABar />` once |

---

## Out of Scope

- No price display
- No mobile-specific layout variation (single row works on all breakpoints)
- No connection to configurator state (version, color, price)
