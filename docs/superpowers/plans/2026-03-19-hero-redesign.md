# Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic centered hero with an editorial left-anchored layout using Cormorant Garamond + Geist Sans, a three-layer gradient overlay, clip-path entry animations, and scroll-driven Ken Burns + fade-out effects.

**Architecture:** The Hero component is a self-contained client component. Font registration lives in `layout.tsx` (server component) with a CSS variable exposed to Tailwind v4 via `globals.css`. Scroll behavior is driven by Framer Motion's `useScroll`/`useTransform` — no global state, no side effects beyond the component boundary.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, Framer Motion, `next/font/google`, Jest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-19-hero-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/layout.tsx` | Modify | Register Cormorant Garamond font, expose CSS variable |
| `src/app/globals.css` | Modify | Add `--font-family-cormorant` token to Tailwind `@theme` |
| `src/components/sections/Hero.tsx` | Rewrite | New layout, overlay, copy, animations, scroll behavior |
| `src/__tests__/Hero.test.tsx` | Create | Smoke test — renders without crashing, key copy present |

---

## Task 1: Register Cormorant Garamond Font

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

### Why this comes first
The font CSS variable must be available before the Hero component uses `font-cormorant`. If the variable is missing, Tailwind generates an empty utility class and the font silently falls back to Georgia. Do this first so the Hero task can be tested end-to-end.

- [ ] **Step 1.1: Add font import and variable to layout.tsx**

Replace the contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import CookieBanner from '@/components/CookieBanner'

const cormorant = Cormorant_Garamond({
  weight: ['300'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={cormorant.variable}>
      <body className={GeistSans.className}>
        <Navbar />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

Key changes:
- Import `Cormorant_Garamond` from `'next/font/google'`
- Instantiate with `weight: ['300']`, `style: ['normal', 'italic']`, `subsets: ['latin']`, `variable: '--font-cormorant'`
- Apply `cormorant.variable` as a class on `<html>` (makes `--font-cormorant` available as a CSS custom property site-wide)
- `GeistSans.className` stays on `<body>` (unchanged)

- [ ] **Step 1.2: Add font token to globals.css**

In `src/app/globals.css`, add one line inside the existing `@theme` block:

```css
@theme {
  --color-background: #0A0A0A;
  --color-surface: #111111;
  --color-card: #1A1A1A;
  --color-accent: #0070C9;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A1A1A1;

  --font-family-sans: var(--font-geist-sans), Inter, system-ui, sans-serif;
  --font-family-cormorant: var(--font-cormorant), Georgia, serif;   /* ADD THIS LINE */

  --animate-fade-up: fadeUp 0.6s ease-out forwards;
  --animate-count-up: countUp 1s ease-out forwards;

  --keyframes-fadeUp-0%: { opacity: 0; transform: translateY(20px); };
  --keyframes-fadeUp-100%: { opacity: 1; transform: translateY(0); };
}
```

This exposes a `font-cormorant` utility class via Tailwind v4's automatic token mapping.

- [ ] **Step 1.3: Verify the build compiles**

```bash
npm run build
```

Expected: build succeeds, no TypeScript or font-related errors. If `Cormorant_Garamond` is not found, check the import — the function name must match exactly (`Cormorant_Garamond`, not `CormorantGaramond`).

- [ ] **Step 1.4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add Cormorant Garamond font via next/font/google"
```

---

## Task 2: Write Hero Smoke Test

**Files:**
- Create: `src/__tests__/Hero.test.tsx`

### Why before the rewrite
The test locks in the expected copy so a future regression (or accidental revert) is immediately caught. Writing it before the implementation also forces a clean look at what "correct" means.

- [ ] **Step 2.1: Create the test file**

Create `src/__tests__/Hero.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Framer Motion uses browser APIs not available in jsdom.
// Mock the parts Hero uses so the test focuses on markup, not animation.
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          // eslint-disable-next-line react/display-name
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useReducedMotion: () => false,
  }
})

import Hero from '@/components/sections/Hero'

describe('Hero', () => {
  it('renders headline copy', () => {
    render(<Hero />)
    expect(screen.getByText('Além do')).toBeInTheDocument()
    expect(screen.getByText('Horizonte.')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<Hero />)
    expect(
      screen.getByText(/Nissan Leaf · 100% Elétrico · Reserva Antecipada/i)
    ).toBeInTheDocument()
  })

  it('renders both CTAs', () => {
    render(<Hero />)
    expect(screen.getByText('Reservar agora')).toBeInTheDocument()
    expect(screen.getByText('Saber mais')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Run the test — expect FAIL (Hero not yet updated)**

```bash
npm test -- --testPathPattern=Hero --no-coverage
```

Expected: tests fail because the current Hero component still renders the old copy ("O futuro chegou." etc.). This confirms the tests are wired up correctly and will catch the rewrite.

---

## Task 3: Rewrite Hero Component

**Files:**
- Rewrite: `src/components/sections/Hero.tsx`

- [ ] **Step 3.1: Replace Hero.tsx with the new implementation**

Replace the full contents of `src/components/sections/Hero.tsx` with:

```tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Scroll-driven values
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.6], [0.7, 1])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -24])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Animation prop factories — skipped entirely when reduced motion is preferred
  function entryFade(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6, delay, ease: 'easeOut' },
    }
  }

  function fadeUp(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay, ease: 'easeOut' },
    }
  }

  function clipReveal(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      animate: { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
      transition: { duration: 0.7, delay, ease: 'easeOut' },
    }
  }

  function scaleRule() {
    if (prefersReducedMotion) return {}
    return {
      initial: { scaleX: 0 },
      animate: { scaleX: 1 },
      transition: { duration: 0.5, delay: 0.15, ease: 'easeOut' },
      style: { transformOrigin: 'left center' },
    }
  }

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden">

      {/* Video background — wrapped in motion.div for Ken Burns scroll scale */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ scale: videoScale }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/nissan-leaf-hero.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/videos/lhd_h.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay Layer 1: top vignette — barely dims the moon/sky */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%)',
        }}
      />

      {/* Overlay Layer 2: bottom-to-solid gradient — animated on scroll */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 40%, #0A0A0A 100%)',
          opacity: gradientOpacity,
        }}
      />

      {/* Overlay Layer 3: left edge vignette — contrast for the text block */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)',
        }}
      />

      {/* Content block — fades and lifts on scroll */}
      <motion.div
        className="absolute bottom-16 md:bottom-20 left-0 pl-8 md:pl-16 lg:pl-24 z-20"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Label */}
        <motion.p
          className="text-xs md:text-sm text-white/50 tracking-[0.2em] font-sans font-light uppercase mb-4"
          {...entryFade(0)}
        >
          Nissan Leaf · 100% Elétrico · Reserva Antecipada
        </motion.p>

        {/* Thin rule */}
        <motion.div
          className="w-12 border-t border-white/30 mb-6"
          {...scaleRule()}
        />

        {/* Headline — two lines with italic/roman contrast */}
        <h1 className="font-cormorant font-light leading-none mb-4">
          <span className="block overflow-hidden">
            <motion.span
              className="block text-6xl md:text-7xl lg:text-[9rem] text-white italic"
              {...clipReveal(0.3)}
            >
              Além do
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-6xl md:text-7xl lg:text-[9rem] text-white not-italic"
              {...clipReveal(0.45)}
            >
              Horizonte.
            </motion.span>
          </span>
        </h1>

        {/* Subline */}
        <motion.p
          className="text-base md:text-lg text-white/70 font-sans font-light max-w-md mb-8"
          {...fadeUp(0.7)}
        >
          O Nissan Leaf foi construído para quem nunca parou de imaginar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-row gap-4"
          {...fadeUp(0.9)}
        >
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Saber mais
          </Button>
        </motion.div>
      </motion.div>

    </section>
  )
}
```

- [ ] **Step 3.2: Run the tests — expect PASS**

```bash
npm test -- --testPathPattern=Hero --no-coverage
```

Expected: all 3 tests pass. If any fail, check that the copy in the component matches the test exactly (case-sensitive, including the middle dot `·` character — it is U+00B7, not a hyphen or asterisk).

- [ ] **Step 3.3: Run the full build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. Common issues:
- `useRef<HTMLElement>` — if the section ref type causes a mismatch, use `useRef<HTMLDivElement>` and change `<section>` to `<div>` (or cast: `ref={heroRef as React.RefObject<HTMLDivElement>}`)
- `font-cormorant` class not found — means Task 1 Step 1.2 was skipped or the `@theme` block has a syntax error

- [ ] **Step 3.4: Visual verification in dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

| Check | Expected |
|-------|----------|
| Headline font | Cormorant Garamond — hairline serif, clearly different from the rest of the page |
| Line 1 ("Além do") | Italic |
| Line 2 ("Horizonte.") | Roman (not italic) |
| Layout | Text block anchored to bottom-left, NOT centered |
| Right side | Video breathes freely — no text, no overlay darkness |
| Top of video | Moon/sky largely unobstructed (very faint top vignette only) |
| Bottom of hero | Blends seamlessly into the dark background — no visible cut |
| Scroll | Text fades and lifts upward; bottom darkens; video scales slightly |
| Mobile (< 768px) | Headline at `text-6xl`, still readable, still left-aligned |

- [ ] **Step 3.5: Commit**

```bash
git add src/components/sections/Hero.tsx src/__tests__/Hero.test.tsx
git commit -m "feat: redesign hero with editorial layout, Cormorant serif, and scroll effects"
```
