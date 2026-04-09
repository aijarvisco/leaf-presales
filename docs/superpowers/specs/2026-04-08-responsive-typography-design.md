# Responsive Typography – Screen-Size Differentiation

**Date:** 2026-04-08

## Problem

Typography sizes are identical on a MacBook Air 13" and a 27" monitor. Two root causes:

1. **Hero h1** uses `xl:text-8xl` which triggers at 1280px (MacBook CSS viewport). There is no `2xl` class, so larger monitors get the same size.
2. **CSS variables** use `clamp()` values whose max is hit at ~1120–1143px viewport width — both screens are well past this ceiling, producing identical output.

## Goal

Make the MacBook (xl / ~1280px CSS viewport) show noticeably smaller headings than a 27" monitor (2xl / ~1536px+ CSS viewport), without changing how large screens look today.

## Scope

Two files, two changes. Section by section as agreed.

---

## Change 1 — `src/components/sections/Hero.tsx`

### h1

| Breakpoint | Before | After |
|---|---|---|
| `xl` (1280px / MacBook) | `text-8xl` = 96px | `text-7xl` = 72px |
| `2xl` (1536px+ / 27" monitor) | *(inherits xl)* = 96px | `text-8xl` = 96px |

Full class string:
- Before: `text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl`
- After: `text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-7xl 2xl:text-8xl`

### Label (`Novo Nissan Leaf`)

- Before: `text-2xl sm:text-3xl`
- After: `text-2xl sm:text-3xl 2xl:text-4xl`

Keeps the label-to-headline hierarchy consistent on large screens.

---

## Change 2 — `src/app/globals.css`

### `--text-display` (used in DesignIntroSection)

| Viewport | Before | After |
|---|---|---|
| MacBook (~1280px) | 80px (5rem, clamped) | 57.6px (3.6rem) |
| 27" monitor (~1920px) | 80px (5rem, clamped) | 80px (5rem, clamped) |

- Before: `clamp(2rem, 7vw, 5rem)` — max hit at ~1143px
- After: `clamp(2rem, 4.5vw, 5rem)` — max hit at ~1778px

### `--text-h2` (used in Highlights, ClosingSection)

| Viewport | Before | After |
|---|---|---|
| MacBook (~1280px) | 56px (3.5rem, clamped) | 44.8px (2.8rem) |
| 27" monitor (~1920px) | 56px (3.5rem, clamped) | 56px (3.5rem, clamped) |

- Before: `clamp(1.75rem, 5vw, 3.5rem)` — max hit at ~1120px
- After: `clamp(1.75rem, 3.5vw, 3.5rem)` — max hit at ~1600px

---

## Affected Components

| Component | File | Change |
|---|---|---|
| Hero | `src/components/sections/Hero.tsx` | h1 and label classes |
| DesignIntroSection | `src/components/sections/DesignIntroSection.tsx` | via `--text-display` |
| Highlights | `src/components/sections/Highlights.tsx` | via `--text-h2` |
| ClosingSection | `src/components/sections/ClosingSection.tsx` | via `--text-h2` |

No new files. No structural changes.
