# Header Shrink on Scroll — Design Spec

**Date:** 2026-03-27

## Overview

The `SiteHeader` currently transitions from transparent to solid black at a fixed scroll threshold of 80px. This spec replaces that behaviour with a scroll-driven animation that continuously shrinks the header's width, height, and corners as the user scrolls, producing a floating frosted-glass pill effect.

## Structure

The current `<header>` element uses `left-0 right-0` which anchors it full-width but cannot be animated for a centred shrink. The new structure wraps the animated header:

```
<div pointer-events-none>  ← invisible full-width fixed container (left-0 right-0 top-6 z-50)
  <motion.header mx-auto pointer-events-auto>  ← animated: width, height, borderRadius, background, backdropFilter, paddingX
    [logo]  [buttons]
  </motion.header>
</div>
```

The outer wrapper must be `pointer-events-none` so the invisible margins don't intercept clicks. The inner `motion.header` restores `pointer-events-auto`. It uses `mx-auto` so it stays centred as its width narrows.

The existing Tailwind padding classes (`px-8 md:px-16`) must be removed from the inner element — animated inline `paddingLeft`/`paddingRight` replace them. The responsive breakpoint padding (`md:px-16`) is intentionally dropped; the animated value covers all viewports.

## Animated Properties

All values interpolate as `scrollY` goes from `0` to `300px`:

| Property | 0 px scroll | 300 px scroll |
|---|---|---|
| `width` | `100%` | `76%` |
| `height` | `64px` | `48px` |
| `borderRadius` | `0px` | `14px` |
| `background` | `transparent` | `rgba(0,0,0,0.55)` |
| `backdropFilter` | `blur(0px)` | `blur(16px)` |
| `paddingLeft/Right` | `64px` | `32px` |

The background end value is `rgba(0,0,0,0.55)` — dark enough to provide contrast for white text without overwhelming the frosted-glass effect.

## Implementation Approach

- Replace `useState`/`useEffect` scroll listener with Framer Motion `useScroll()` (window-level, no target):
  ```ts
  const { scrollY } = useScroll()
  ```
- Use `useTransform(scrollY, [0, 300], [...], { ease: easeOut })` for each property in the table above. Passing an `easeOut` ease array produces a premium deceleration feel consistent with the Hero component.
- Apply all animated values as `style` props on the `motion.header`.
- The existing `scrolled` state and the `bg-black` / `bg-transparent` class toggle are removed entirely — the animated `background` handles it.
- Set `style={{ willChange: 'transform, backdrop-filter' }}` on the `motion.header`. Using `transform` (not `width`) keeps the hint on compositor-friendly properties and avoids potential stacking-context side effects from promoting `width` directly.

## Accessibility

When `prefersReducedMotion` is true (via Framer Motion's `useReducedMotion`), skip `useTransform` entirely. Apply static inline styles instead: full width, `height: 64px`, no border-radius, `background: rgba(0,0,0,0.85)` (solid, legible at all scroll positions). This matches the Hero's pattern of returning `{}` from animation factories when reduced motion is preferred — the element renders in its natural state with no animation.

## Tests

The existing `SiteHeader` tests assert `bg-transparent` / `bg-black` className toggling and a `scrollY > 80` threshold — all of which are removed by this change. Those tests must be replaced with assertions that verify:
- The component renders without error.
- `useScroll` is called (window-level, no target).
- The `motion.header` receives `style` props (not className-based background).
- In reduced-motion mode, static styles are applied and no `useTransform` values are present.

## Out of Scope

- Logo scale changes
- Button layout changes
- Any other section modifications
