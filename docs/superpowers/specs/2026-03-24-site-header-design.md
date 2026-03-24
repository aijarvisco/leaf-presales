# Site Header Design

**Date:** 2026-03-24
**Status:** Approved

## Overview

Replace the existing scroll-triggered `Navbar` with a static `SiteHeader` that sits at the top of the page. The header and hero together fill exactly one screen height (100vh). The header is not fixed or sticky — it scrolls away with the page.

## Layout

A `h-screen flex flex-col` wrapper div in `page.tsx` contains `<SiteHeader>` and `<Hero>` as direct children. The header takes its natural height (h-14 = 56px); the hero fills the remaining space via `flex-1`.

```
┌─────────────────────────────────────────────────────────────┐  ← 100vh wrapper
│  [NISSAN logo]              [Ser Contactado]  [Reservar →]  │  ← SiteHeader h-14
│─────────────────────────────────────────────────────────────│  ← border-b white/10
│                                                             │
│                    Hero (flex-1, video bg)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## SiteHeader Component

**File:** `src/components/layout/SiteHeader.tsx`
**Directive:** `'use client'` (required for onClick scroll handlers)

- Container: `flex items-center justify-between px-8 md:px-16 h-14`
- Background: `bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10`
- Left: Nissan wordmark via `next/image`, `src="/nissan-lettering.svg"`, `width={120}`, `height={17}`, `alt="Nissan"`, white via `style={{ filter: 'brightness(0) invert(1)' }}`
- Right: ghost "Ser Contactado" button + primary "Reservar" button in a `flex gap-3`

## Buttons

- **Reservar (primary):** `Button variant="primary"`. On click: `document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })`
- **Ser Contactado (ghost):** `Button variant="ghost"`. On click: `document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })`. The `ghost` variant already exists in `Button.tsx` — use it as-is.

## Hero Scroll Behaviour Note

The Hero uses `useScroll` with `offset: ['start start', 'end start']` anchored to the hero element. Changing the hero from `h-screen` to `flex-1` (inside a 100vh wrapper) shortens the tracked element by ~56px. The Ken Burns scale and text fade/lift animations will be minimally affected. This is acceptable for now; if scroll feel needs re-tuning, the `useScroll` offset or animation ranges can be adjusted after implementation.

## File Changes

| File | Change |
|------|--------|
| `src/components/layout/SiteHeader.tsx` | **Create** new component |
| `src/components/layout/Navbar.tsx` | **Delete** |
| `src/app/layout.tsx` | Delete the commented-out Navbar import line entirely |
| `src/app/page.tsx` | Import `SiteHeader`; wrap `<SiteHeader>` + `<Hero>` in `<div className="h-screen flex flex-col">` |
| `src/components/sections/Hero.tsx` | Change `h-screen` → `flex-1` on the `<section>` tag |

## Out of Scope

- Sticky/fixed scroll behaviour
- Mobile hamburger menu
- Active section highlighting
