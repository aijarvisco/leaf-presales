# Bottom CTA Bar — Design Spec

**Date:** 2026-03-27
**Status:** Approved

---

## Overview

A globally persistent bottom bar that prompts users to configure the Nissan Leaf. Visible from page load (including over the Hero). Hides automatically when the Configurador or Closing sections are in view, avoiding duplication with those sections' own CTAs.

---

## Component

**File:** `src/components/ui/BottomCTABar.tsx`

Self-contained client component (`'use client'` required — uses `IntersectionObserver`, `useState`, `useEffect`, and `useRef`). No props; all copy and behavior are static.

---

## Layout

- `fixed bottom-0 left-0 right-0 z-30`
- `bg-[#1C1C1E]` with `border-t border-white/10`
- Single horizontal row on all breakpoints
- **Left:** `"Nissan Leaf"` semibold white + `"/ Entregas previstas em Maio"` in `text-white/50`
- **Right:** `"Configurar"` button, `bg-[#E8372F]` (brand red), `rounded-full`, scrolls to `#configurador` on click
- Outer `div`: `pb-[env(safe-area-inset-bottom,0px)]` for iOS home indicator clearance; inner content row: `h-14`

**z-index rationale:** z-30 sits below `SiteHeader` (z-50) and below the `ReservationDrawer` backdrop (z-40). `StickyBar.tsx` (z-50, `fixed bottom-0`) is dead code — not imported anywhere in the codebase. The z-30 value assumes `StickyBar` remains dead; re-activating it would require a z-index audit. `ContactDrawer.tsx` (z-40 backdrop) is used by `LeadSection.tsx`, but `LeadSection` is not mounted in `page.tsx` — so `ContactDrawer` is also not instantiated at runtime today. If `LeadSection` is re-added, `ContactDrawer`'s z-40 backdrop would sit above the bar (z-30) without conflict, but a suppression condition for `ContactDrawer` open state should be evaluated at that time.

---

## Visibility Logic

Bar is hidden (`translate-y-full`) when any condition is true; slides in otherwise.

Transition: `transition-transform duration-300 ease-in-out motion-reduce:transition-none` — respects `prefers-reduced-motion`.

When hidden: outer `div` has `aria-hidden="true"`; button has `tabIndex={-1}`. If focus is on the button when the bar hides, focus moves to `<body>` — this edge case is accepted.

**Initial state:** all three booleans start `false` (bar visible). `IntersectionObserver` callbacks are authoritative from first observation and correct state before first paint in most cases. A brief flash is possible on hydration if the user lands mid-page with a suppressed section already in view; this is accepted.

**React Strict Mode note:** In development, React intentionally remounts effects. The mount-guard `useRef` in `Configurador.tsx` (see below) survives remount, so the guard is bypassed on the second mount and a spurious `reservationdrawer:close` event fires. This is development-only behavior; it has no effect in production. `BottomCTABar` ignores redundant `close` events since `drawerOpen` is already `false` at that point.

### Suppression conditions

**1. Configurador section (`#configurador`)**
`IntersectionObserver` with default options (threshold: 0). Fires when any part of the section enters the viewport.

**2. Closing section (`id="closing"`)**
`IntersectionObserver` with default options (threshold: 0).

The `#closing` element is `300vh` tall. With `threshold: 0`, `isIntersecting` is `true` whenever **any part** of the element intersects the viewport, and `false` only when the **entire** element is outside the viewport. This means:
- Scrolling down: bar hides when the section's top edge enters the viewport from below ✓
- Scrolling up through the section: bar stays hidden throughout (section still intersects) ✓
- Bar reappears only once the section's top edge exits the viewport bottom (section fully below) ✓

This is the correct behavior. No `rootMargin` adjustment is needed.

> `id="closing"` must be added to `<section style={{ height: '300vh' }} ref={containerRef}>` in `ClosingSection.tsx`. Adding `id` and `ref` to the same element is safe — they are independent React/DOM mechanisms. Do not add it to the inner sticky `<div>` or the sibling `<footer>`.
>
> **Footer note:** `ClosingSection` returns a React Fragment wrapping the `300vh` `<section>` and a short `<footer>`. The observer watches only the `<section>`. Once the user scrolls past it into the footer, the bar reappears. This is intentional — the footer contains only legal links and the Nissan logo with no competing CTAs.

**3. ReservationDrawer open**
The bar hides while the drawer is open to prevent scroll-away during the reservation flow and to avoid visual conflict with its z-40 backdrop.

`Configurador` dispatches window custom events when `isDrawerOpen` changes. A `useRef` mount-guard suppresses the initial dispatch on mount (React `useEffect` with a dep array fires on first render; the guard skips that):

```ts
// Configurador.tsx — additive; separate from the existing scroll-pin useEffect
const drawerEventMounted = useRef(false)
useEffect(() => {
  if (!drawerEventMounted.current) {
    drawerEventMounted.current = true
    return
  }
  window.dispatchEvent(new CustomEvent(
    isDrawerOpen ? 'reservationdrawer:open' : 'reservationdrawer:close'
  ))
}, [isDrawerOpen])
```

`BottomCTABar` subscribes to both events in its own `useEffect` (with cleanup on unmount) and updates `drawerOpen` state. One-frame lag between drawer opening and bar hiding is accepted — the drawer backdrop animates in from `opacity-0`, so the bar is hidden before the backdrop reaches full opacity.

### Derived state

```
hidden = configuradorVisible || closingVisible || drawerOpen
```

---

## Scroll Target

```ts
document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
```

Intentional; consistent with `ClosingSection`'s own reserve CTA. `SiteHeader` targets both `#contacto` and `#reservar` — both belong to sections (`LeadSection`, `CTASection`) that are currently unmounted. These pre-existing inconsistencies are out of scope.

---

## Accessibility

- `aria-hidden="true"` on outer `div` when `hidden = true`
- `tabIndex={-1}` on button when `hidden = true`
- `aria-label="Ir para o configurador"` on button

---

## Changes Required

All items below are **new work** — none of this infrastructure currently exists in the codebase.

| File | Change | Notes |
|------|--------|-------|
| `src/components/ui/BottomCTABar.tsx` | **Create** new component | Does not exist yet |
| `src/components/sections/ClosingSection.tsx` | **Edit**: add `id="closing"` to `<section style={{ height: '300vh' }} ref={containerRef}>` | Currently no `id` on that element |
| `src/components/sections/Configurador.tsx` | **Edit**: add mount-guarded `useEffect` dispatching `reservationdrawer:open/close` on `isDrawerOpen` changes | No custom event dispatch exists today; additive — do not touch the existing scroll-pin `useEffect` |
| `src/app/page.tsx` | **Edit**: wrap return in a Fragment and mount `<BottomCTABar />` outside `<main>`: `<><main>…</main><BottomCTABar /></>` | Currently returns a plain `<main>` with no Fragment root |

---

## Out of Scope

- No price display
- No mobile layout variation beyond iOS safe-area padding
- `LeadSection` (`#contacto`) and `CTASection` (`#reservar`) not currently mounted; suppression list should be revisited if re-added (particularly for `ContactDrawer` z-index interaction)
- `StickyBar.tsx` is dead code; left in place, not modified
- `ValuesSection` is deliberately mounted twice in `page.tsx`; this is intentional and unrelated to this feature
