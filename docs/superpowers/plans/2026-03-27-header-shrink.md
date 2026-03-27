# Header Shrink on Scroll — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SiteHeader's fixed threshold background toggle with a scroll-driven animation that shrinks the header into a frosted-glass floating pill as the user scrolls.

**Architecture:** A full-width fixed outer `<div>` holds a `motion.header` that interpolates width, height, border-radius, background, backdrop-filter, and horizontal padding from `scrollY` 0 → 300px using `easeOut`. The outer div is `pointer-events-none`; the inner header restores `pointer-events-auto`. When `prefersReducedMotion` is true the animated style is replaced with a static fallback.

**Tech Stack:** Next.js 16, Framer Motion 12 (`useScroll`, `useTransform`, `useReducedMotion`, `motion`, `easeOut`), React Testing Library, Jest/jsdom

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/layout/SiteHeader.tsx` | Modify | Scroll-driven animated header |
| `tests/components/layout/SiteHeader.test.tsx` | Modify | Tests for new structure and behaviour |

---

## Task 1: Replace the test file

**Files:**
- Modify: `tests/components/layout/SiteHeader.test.tsx`

The existing tests for `bg-transparent`/`bg-black` className toggling and the `scrollY > 80` threshold will all fail after the rewrite. Replace them now so the tests drive the implementation.

- [ ] **Step 0: Verify the current tests pass before touching anything**

```bash
npx jest tests/components/layout/SiteHeader.test.tsx --no-coverage
```

Expected: all existing tests pass. If any fail, fix them first before proceeding — the red/green baseline must be real.

- [ ] **Step 1: Write the new test file**

Replace the entire contents of `tests/components/layout/SiteHeader.test.tsx` with:

```tsx
// tests/components/layout/SiteHeader.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Track whether reduced motion is active — mutate this in individual tests
let mockPrefersReducedMotion = false

// Spy on useScroll so we can assert it is called window-level (no target)
const mockUseScroll = jest.fn(() => ({ scrollY: { get: () => 0 } }))

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
    useScroll: mockUseScroll,
    useTransform: () => 0,
    useReducedMotion: () => mockPrefersReducedMotion,
  }
})

import SiteHeader from '@/components/layout/SiteHeader'

describe('SiteHeader', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = false
    mockUseScroll.mockClear()
  })

  // ── Content ────────────────────────────────────────────────────────────────

  it('renders the Nissan logo', () => {
    render(<SiteHeader />)
    expect(screen.getByAltText('Nissan')).toBeInTheDocument()
  })

  it('renders a "Ser Contactado" button', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('button', { name: /Ser Contactado/i })).toBeInTheDocument()
  })

  it('renders a "Reservar" button', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('button', { name: /^Reservar$/i })).toBeInTheDocument()
  })

  // ── Scroll tracking ────────────────────────────────────────────────────────

  it('calls useScroll without a target (window-level)', () => {
    render(<SiteHeader />)
    expect(mockUseScroll).toHaveBeenCalledWith()
  })

  // ── Structure ──────────────────────────────────────────────────────────────

  it('outer wrapper is fixed and z-50', () => {
    render(<SiteHeader />)
    const wrapper = screen.getByRole('banner').parentElement!
    expect(wrapper.className).toContain('fixed')
    expect(wrapper.className).toContain('z-50')
  })

  it('outer wrapper has pointer-events-none', () => {
    render(<SiteHeader />)
    const wrapper = screen.getByRole('banner').parentElement!
    expect(wrapper.className).toContain('pointer-events-none')
  })

  it('inner header has pointer-events-auto', () => {
    render(<SiteHeader />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('pointer-events-auto')
  })

  it('inner header has no bg-transparent or bg-black className (background is animated via style)', () => {
    render(<SiteHeader />)
    const header = screen.getByRole('banner')
    expect(header.className).not.toContain('bg-transparent')
    expect(header.className).not.toContain('bg-black')
  })

  // ── Reduced motion ─────────────────────────────────────────────────────────

  it('applies solid static background when prefers-reduced-motion is set', () => {
    mockPrefersReducedMotion = true
    render(<SiteHeader />)
    const header = screen.getByRole('banner') as HTMLElement
    expect(header.style.background).toBe('rgba(0,0,0,0.85)')
  })

  it('applies full width when prefers-reduced-motion is set', () => {
    mockPrefersReducedMotion = true
    render(<SiteHeader />)
    const header = screen.getByRole('banner') as HTMLElement
    expect(header.style.width).toBe('100%')
  })

  // ── Interactions ───────────────────────────────────────────────────────────

  it('"Ser Contactado" button triggers scroll to #contacto', () => {
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    render(<SiteHeader />)
    fireEvent.click(screen.getByRole('button', { name: /Ser Contactado/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('contacto')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    mockGetElementById.mockRestore()
  })

  it('"Reservar" button triggers scroll to #reservar', () => {
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    render(<SiteHeader />)
    fireEvent.click(screen.getByRole('button', { name: /^Reservar$/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('reservar')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    mockGetElementById.mockRestore()
  })
})
```

- [ ] **Step 2: Run the tests — expect failures on the new structure/reduced-motion/scroll tests**

```bash
npx jest tests/components/layout/SiteHeader.test.tsx --no-coverage
```

Expected: the three content tests and two interaction tests pass. The structure, reduced-motion, and `useScroll` tests fail because the old component still has `fixed z-50` on the `<header>` itself, uses className-based background, and calls `useScroll` differently (or not at all).

---

## Task 2: Rewrite SiteHeader component

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/layout/SiteHeader.tsx` with:

```tsx
'use client'
import { useScroll, useTransform, useReducedMotion, motion, easeOut } from 'framer-motion'
import Image from 'next/image'

export default function SiteHeader() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()

  // Always call hooks unconditionally — use results only when reduced motion is not preferred
  const animatedStyle = {
    width:          useTransform(scrollY, [0, 300], ['100%', '76%'],       { ease: easeOut }),
    height:         useTransform(scrollY, [0, 300], [64, 48],              { ease: easeOut }),
    borderRadius:   useTransform(scrollY, [0, 300], [0, 14],               { ease: easeOut }),
    background:     useTransform(scrollY, [0, 300], ['transparent', 'rgba(0,0,0,0.55)'], { ease: easeOut }),
    backdropFilter: useTransform(scrollY, [0, 300], ['blur(0px)', 'blur(16px)'],         { ease: easeOut }),
    paddingLeft:    useTransform(scrollY, [0, 300], [64, 32],              { ease: easeOut }),
    paddingRight:   useTransform(scrollY, [0, 300], [64, 32],              { ease: easeOut }),
  }

  const staticStyle = {
    width:          '100%',
    height:         '64px',
    borderRadius:   0,
    background:     'rgba(0,0,0,0.85)',
    backdropFilter: 'none',
    paddingLeft:    '64px',
    paddingRight:   '64px',
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="fixed left-0 right-0 top-6 z-50 pointer-events-none">
      <motion.header
        className="mx-auto flex items-center justify-between pointer-events-auto"
        style={{
          willChange: 'transform, backdrop-filter',
          ...(prefersReducedMotion ? staticStyle : animatedStyle),
        }}
      >
        <Image
          src="/nissan-lettering.svg"
          alt="Nissan"
          width={180}
          height={26}
          style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
          priority
        />
        <div className="flex items-center gap-4">
          <button
            className="text-white text-sm font-normal cursor-pointer"
            onClick={() => scrollTo('contacto')}
          >
            Ser Contactado
          </button>
          <button
            className="bg-[#E8372F] text-white hover:bg-[#D42F27] px-5 py-2 rounded-lg text-sm font-normal transition-colors duration-200 cursor-pointer"
            onClick={() => scrollTo('reservar')}
          >
            Reservar
          </button>
        </div>
      </motion.header>
    </div>
  )
}
```

- [ ] **Step 2: Run the SiteHeader tests**

```bash
npx jest tests/components/layout/SiteHeader.test.tsx --no-coverage
```

Expected: all 12 tests pass.

- [ ] **Step 3: Run the full project test suite to check for regressions**

```bash
npx jest --no-coverage
```

Expected: all tests pass. If any other test imports or renders `SiteHeader`, verify it still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/SiteHeader.tsx tests/components/layout/SiteHeader.test.tsx
git commit -m "feat: scroll-driven shrink animation on SiteHeader"
```
