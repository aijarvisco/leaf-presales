# Hero Header Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current above-hero dark SiteHeader with a full-viewport hero and a fixed overlay header that starts transparent and transitions to solid black when scrolled past 80px.

**Architecture:** `SiteHeader` becomes a `position: fixed` overlay component that tracks `window.scrollY` via a `useEffect` scroll listener and toggles a `scrolled` boolean to swap between `bg-transparent` and `bg-black`. `Hero` gets its own `h-screen` instead of relying on `flex-1`, and `page.tsx` removes the wrapper div that previously gave both components their shared height.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Jest + React Testing Library

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `src/components/layout/SiteHeader.tsx` | Full rewrite — fixed overlay, scroll state, new items |
| Modify | `src/components/sections/Hero.tsx` | `flex-1` → `h-screen` in section className |
| Modify | `src/app/page.tsx` | Remove `h-screen flex-col` wrapper div |
| Create | `tests/components/layout/SiteHeader.test.tsx` | New test file for SiteHeader |

---

## Task 1: Write failing tests for the new SiteHeader

**Files:**
- Create: `tests/components/layout/SiteHeader.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// tests/components/layout/SiteHeader.test.tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import SiteHeader from '@/components/layout/SiteHeader'

describe('SiteHeader', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  })

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

  it('has transparent background at top of page', () => {
    render(<SiteHeader />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('bg-transparent')
    expect(header.className).not.toContain('bg-black')
  })

  it('switches to black background after scrolling past 80px', () => {
    render(<SiteHeader />)
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    act(() => { window.dispatchEvent(new Event('scroll')) })
    const header = screen.getByRole('banner')
    expect(header.className).toContain('bg-black')
    expect(header.className).not.toContain('bg-transparent')
  })

  it('returns to transparent background when scrolled back above 80px', () => {
    render(<SiteHeader />)
    // scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    act(() => { window.dispatchEvent(new Event('scroll')) })
    // scroll back up
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    act(() => { window.dispatchEvent(new Event('scroll')) })
    const header = screen.getByRole('banner')
    expect(header.className).toContain('bg-transparent')
    expect(header.className).not.toContain('bg-black')
  })

  it('is fixed-positioned (z-50)', () => {
    render(<SiteHeader />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('fixed')
    expect(header.className).toContain('z-50')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/components/layout/SiteHeader.test.tsx --no-coverage
```

Expected: all tests FAIL — `SiteHeader` currently renders a dark non-fixed header, not the overlay one.

---

## Task 2: Rewrite SiteHeader.tsx

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

- [ ] **Step 1: Replace the entire file contents**

```tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 px-8 md:px-16 flex items-center justify-between transition-colors duration-300 motion-reduce:transition-none ${
        scrolled ? 'bg-black' : 'bg-transparent'
      }`}
    >
      <Image
        src="/nissan-lettering.svg"
        alt="Nissan"
        width={100}
        height={14}
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
    </header>
  )
}
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
npx jest tests/components/layout/SiteHeader.test.tsx --no-coverage
```

Expected: all 7 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SiteHeader.tsx tests/components/layout/SiteHeader.test.tsx
git commit -m "feat: rewrite SiteHeader as transparent overlay with scroll-triggered black bg"
```

---

## Task 3: Update Hero.tsx — standalone h-screen

**Files:**
- Modify: `src/components/sections/Hero.tsx` (line 54)

The Hero's `<section>` currently uses `flex-1` to fill the remaining height inside the `h-screen flex-col` wrapper. Once that wrapper is removed, `flex-1` resolves to nothing. Replace it with `h-screen`.

- [ ] **Step 1: Change the section className on line 54**

Find:
```tsx
<section ref={heroRef} className="relative flex-1 overflow-hidden">
```

Replace with:
```tsx
<section ref={heroRef} className="relative h-screen overflow-hidden">
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
npx jest --no-coverage
```

Expected: all tests PASS (Hero has no dedicated test file; this is a one-line className change with no logic impact).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "style: give Hero its own h-screen now that it is no longer inside a flex-col wrapper"
```

---

## Task 4: Update page.tsx — remove the wrapper div

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove the wrapper div**

Find:
```tsx
    <main>
      <div className="h-screen flex flex-col">
        <SiteHeader />
        <Hero />
      </div>
```

Replace with:
```tsx
    <main>
      <SiteHeader />
      <Hero />
```

(The closing `</div>` on the next line is removed too — it is the wrapper div's closing tag.)

- [ ] **Step 2: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 3: Smoke-test in the browser**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
1. Hero fills the full viewport (no gap at the top)
2. Header is transparent over the hero video
3. Scrolling past ~80px → header background fades to black
4. Scrolling back to top → header fades back to transparent
5. "Ser Contactado" is a plain white text button
6. "Reservar" button is coral (#E8372F)

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: remove h-screen flex-col wrapper now that SiteHeader is a fixed overlay"
```
