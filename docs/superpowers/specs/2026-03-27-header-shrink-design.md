# Header Shrink on Scroll — Design Spec

**Date:** 2026-03-27

## Overview

The `SiteHeader` currently transitions from transparent to solid black at a fixed scroll threshold of 80px. This spec replaces that behaviour with a scroll-driven animation that continuously shrinks the header's width, height, and corners as the user scrolls, producing a floating frosted-glass pill effect.

## Structure

The current `<header>` element uses `left-0 right-0` which anchors it full-width but cannot be animated for a centred shrink. The new structure wraps the animated header:

```
<div>  ← invisible full-width fixed container (left-0 right-0 top-6 z-50)
  <motion.header mx-auto>  ← animated: width, height, borderRadius, background, backdropFilter, padding
    [logo]  [buttons]
  </motion.header>
</div>
```

The inner `motion.header` uses `mx-auto` so it stays centred as its width narrows.

## Animated Properties

All values interpolate as `scrollY` goes from `0` to `300px`:

| Property | 0 px scroll | 300 px scroll |
|---|---|---|
| `width` | `100%` | `76%` |
| `height` | `64px` | `48px` |
| `borderRadius` | `0px` | `14px` |
| `background` | `transparent` | `rgba(10,10,10,0.75)` |
| `backdropFilter` | `blur(0px)` | `blur(16px)` |
| `paddingLeft/Right` | `64px` | `32px` |

## Implementation Approach

- Replace `useState`/`useEffect` scroll listener with Framer Motion `useScroll()` (window-level), which exposes a raw `scrollY` MotionValue.
- Use `useTransform(scrollY, [0, 300], [...])` for each property in the table above.
- Apply all animated values as `style` props on the `motion.header`.
- The existing `scrolled` state and the `bg-black` / `bg-transparent` class toggle are removed entirely — the animated `background` handles it.

## Accessibility

- When `prefers-reduced-motion` is set, all animated values snap to their end state at any scroll > 0 rather than interpolating (consistent with the Hero component's pattern).

## Out of Scope

- Logo scale changes
- Button layout changes
- Any other section modifications
