# Mobile Optimisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Nissan Leaf presales site fully responsive across mobile, tablet, small desktop, and large desktop without breaking the existing desktop experience.

**Architecture:** Mobile-first Tailwind breakpoints (`sm`/`md`/`lg`/`xl`) for layout; CSS `clamp()` custom properties for fluid typography; viewport-responsive card widths for carousels; structural adaptation for HighlightCard on mobile.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, Framer Motion, React, Jest + Testing Library

**Spec:** `docs/superpowers/specs/2026-04-06-mobile-optimization-design.md`

---

## File Map

| File | What changes |
|------|-------------|
| `src/app/layout.tsx` | Add `viewport` export with `viewportFit: 'cover'` |
| `src/app/globals.css` | Add `--text-display` and `--text-h2` CSS vars |
| `src/components/layout/SiteHeader.tsx` | Replace inline 64px padding with responsive Tailwind classes |
| `src/components/sections/Hero.tsx` | Extend h1 responsive steps to include mobile base |
| `src/components/sections/DesignIntroSection.tsx` | Apply `--text-display`, remove `min-w-[900px]`, fix eyebrow label |
| `src/components/sections/AutonomiaSectionV2.tsx` | Apply `--text-display`, fix eyebrow label |
| `src/components/sections/Highlights.tsx` | Apply `--text-h2`, responsive section spacing, mobile peek divisor |
| `src/components/sections/ValuesSection.tsx` | Apply `--text-h2`, responsive section spacing, dynamic card width |
| `src/components/sections/LeadSection.tsx` | Apply `--text-h2`, responsive section spacing |
| `src/components/sections/CTASection.tsx` | Apply `--text-h2`, responsive section spacing |
| `src/components/sections/ClosingSection.tsx` | Apply `--text-h2` |
| `src/components/sections/RangeSavings.tsx` | Apply `--text-h2` |
| `src/components/ui/HighlightCard.tsx` | Mobile text-below layout (`< md`), overlay preserved on `md+` |
| `src/components/ui/BottomCTABar.tsx` | `gap-4 md:gap-24`, safe-area bottom positioning |
| `src/components/forms/ContactForm.tsx` | `grid-cols-1 md:grid-cols-2` |
| `src/components/ui/ContactDrawer.tsx` | Safe-area padding on scroll body |
| `src/components/ui/ReservationDrawer.tsx` | Safe-area padding on scroll body |

---

## Task 1: Foundation — viewport metadata + CSS variables

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

No Jest tests for these changes — CSS custom properties and metadata exports are not meaningful to test in jsdom.

- [ ] **Step 1: Add viewport export to layout.tsx**

Replace the current `layout.tsx` content:

```tsx
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const nissanBrand = localFont({
  src: [
    { path: '../../public/fonts/Nissan Brand Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-nissan',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={nissanBrand.variable}>
      <body className={nissanBrand.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Add CSS custom properties to globals.css**

Add a `:root` block inside `@layer base`, before the existing `body` and heading rules:

```css
@import "tailwindcss";

@theme {
  --color-background: #0A0A0A;
  --color-surface: #111111;
  --color-card: #1A1A1A;
  --color-accent: #0070C9;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A1A1A1;

  --font-family-sans: var(--font-nissan), system-ui, sans-serif;
  --font-family-heading: var(--font-nissan), system-ui, sans-serif;

  --animate-fade-up: fadeUp 0.6s ease-out forwards;
  --animate-count-up: countUp 1s ease-out forwards;

  --keyframes-fadeUp-0%: { opacity: 0; transform: translateY(20px); };
  --keyframes-fadeUp-100%: { opacity: 1; transform: translateY(0); };
}

@layer base {
  :root {
    --text-display: clamp(2rem, 7vw, 5rem);
    --text-h2: clamp(1.75rem, 5vw, 3.5rem);
  }

  body {
    @apply bg-background text-text-primary antialiased m-0 p-0;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-family-heading);
    @apply font-bold tracking-tight;
  }
}
```

- [ ] **Step 3: Run all tests to verify nothing broke**

```bash
npm test -- --passWithNoTests
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add viewport metadata and fluid typography CSS variables"
```

---

## Task 2: Display headings — DesignIntroSection + AutonomiaSectionV2

**Files:**
- Modify: `src/components/sections/DesignIntroSection.tsx`
- Modify: `src/components/sections/AutonomiaSectionV2.tsx`
- Modify: `tests/components/sections/DesignIntroSection.test.tsx`
- Create: `tests/components/sections/AutonomiaSectionV2.test.tsx`

- [ ] **Step 1: Add failing test — DesignIntroSection h2 uses CSS var**

In `tests/components/sections/DesignIntroSection.test.tsx`, add this test inside the existing `describe` block:

```tsx
it('applies --text-display CSS variable to the heading', () => {
  render(<DesignIntroSection />)
  const heading = screen.getByText('Espaço para todas as suas aventuras.')
  expect(heading.style.fontSize).toBe('var(--text-display)')
})

it('eyebrow label has text-base class (not text-3xl)', () => {
  render(<DesignIntroSection />)
  const eyebrow = screen.getByText('Interior')
  expect(eyebrow.className).toContain('text-base')
  expect(eyebrow.className).not.toContain('text-3xl')
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/components/sections/DesignIntroSection.test.tsx
```

Expected: 2 new tests FAIL.

- [ ] **Step 3: Update DesignIntroSection**

Replace `src/components/sections/DesignIntroSection.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function DesignIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 120%', 'end end'],
  })

  const carX = useTransform(scrollYProgress, [0, 1], ['110vw', '0vw'])

  return (
    <section
      ref={sectionRef}
      id="design-intro"
      className="relative bg-[#D5D9DF]"
      style={{ height: '300vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.p
            className="leading-none text-base md:text-xl font-medium tracking-[-0.07em] max-w-5xl mx-auto text-[#0A0A0A]/60"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            Interior
          </motion.p>
          <motion.h2
            className="font-medium tracking-[-0.07em] leading-none text-[#0A0A0A] max-w-3xl"
            style={{ fontSize: 'var(--text-display)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            Espaço para todas as suas aventuras.
          </motion.h2>
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D5D9DF] w-screen"
          style={{ aspectRatio: '2680 / 1200', x: carX }}
        >
          <Image
            src="/images/leaf-top-view.png"
            alt="Nissan Leaf — vista de cima"
            fill
            className="object-contain"
            sizes="100vw"
            loading="eager"
          />
        </motion.div>

      </div>
    </section>
  )
}
```

Key changes: `style={{ fontSize: '80px' }}` → `style={{ fontSize: 'var(--text-display)' }}`, `text-3xl` → `text-base md:text-xl` on eyebrow, `min-w-[900px]` removed.

- [ ] **Step 4: Run tests — DesignIntroSection should pass**

```bash
npm test -- tests/components/sections/DesignIntroSection.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Write failing test — AutonomiaSectionV2**

Create `tests/components/sections/AutonomiaSectionV2.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, output: unknown[]) => output[0],
    useMotionValueEvent: () => {},
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'modal' }, children),
}))

jest.mock('@/components/forms/SavingsCalculator', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'savings-calculator' }),
}))

import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'

describe('AutonomiaSectionV2', () => {
  it('renders the section heading', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Uma bateria que vai onde tu vais.')).toBeInTheDocument()
  })

  it('applies --text-display CSS variable to the heading', () => {
    render(<AutonomiaSectionV2 />)
    const heading = screen.getByText('Uma bateria que vai onde tu vais.')
    expect(heading.style.fontSize).toBe('var(--text-display)')
  })

  it('eyebrow label has text-base class (not text-3xl)', () => {
    render(<AutonomiaSectionV2 />)
    const eyebrow = screen.getByText('Autonomia')
    expect(eyebrow.className).toContain('text-base')
    expect(eyebrow.className).not.toContain('text-3xl')
  })

  it('renders all three stat descriptors', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia em ciclo WLTP')).toBeInTheDocument()
    expect(screen.getByText('De 20 a 80% em carga rápida')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run failing tests**

```bash
npm test -- tests/components/sections/AutonomiaSectionV2.test.tsx
```

Expected: 2 tests FAIL (`--text-display` and eyebrow class tests).

- [ ] **Step 7: Update AutonomiaSectionV2**

In `src/components/sections/AutonomiaSectionV2.tsx`, make two changes:

Change the eyebrow `<p>` (line 62):
```tsx
// Before
<p className="font-medium text-3xl max-w-5xl mx-auto tracking-[-0.07em] leading-none">
  Autonomia
</p>

// After
<p className="font-medium text-base md:text-xl max-w-5xl mx-auto tracking-[-0.07em] leading-none">
  Autonomia
</p>
```

Change the `<h2>` (lines 65-68):
```tsx
// Before
<h2
  className="leading-none text-white font-medium tracking-[-0.07em] max-w-3xl"
  style={{ fontSize: '80px' }}
>

// After
<h2
  className="leading-none text-white font-medium tracking-[-0.07em] max-w-3xl"
  style={{ fontSize: 'var(--text-display)' }}
>
```

- [ ] **Step 8: Run tests — AutonomiaSectionV2 should pass**

```bash
npm test -- tests/components/sections/AutonomiaSectionV2.test.tsx
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/DesignIntroSection.tsx src/components/sections/AutonomiaSectionV2.tsx tests/components/sections/DesignIntroSection.test.tsx tests/components/sections/AutonomiaSectionV2.test.tsx
git commit -m "feat: apply fluid display heading var and fix eyebrow labels on DesignIntro and AutonomiaSectionV2"
```

---

## Task 3: Section h2 headings — apply --text-h2 to all sections

**Files:**
- Modify: `src/components/sections/Highlights.tsx`
- Modify: `src/components/sections/ValuesSection.tsx`
- Modify: `src/components/sections/LeadSection.tsx`
- Modify: `src/components/sections/CTASection.tsx`
- Modify: `src/components/sections/ClosingSection.tsx`
- Modify: `src/components/sections/RangeSavings.tsx`
- Create: `tests/components/sections/Highlights.test.tsx`
- Create: `tests/components/sections/ValuesSection.test.tsx`
- Create: `tests/components/sections/LeadSection.test.tsx`
- Modify: `tests/components/sections/CTASection.test.tsx`
- Modify: `tests/components/sections/ClosingSection.test.tsx`
- Modify: `tests/RangeSavings.test.tsx`

- [ ] **Step 1: Write failing tests for sections without test files**

Create `tests/components/sections/Highlights.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useMotionValue: () => ({ get: () => 0, set: () => {}, getVelocity: () => 0 }),
    animate: jest.fn(),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import Highlights from '@/components/sections/Highlights'

describe('Highlights', () => {
  it('renders the section heading', () => {
    render(<Highlights />)
    expect(screen.getByText('Desenhado para surpreender.')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<Highlights />)
    const heading = screen.getByText('Desenhado para surpreender.')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('renders 4 highlight images', () => {
    render(<Highlights />)
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4)
  })
})
```

Create `tests/components/sections/ValuesSection.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useMotionValue: () => ({ get: () => 0, set: () => {}, getVelocity: () => 0 }),
    animate: jest.fn(),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import ValuesSection from '@/components/sections/ValuesSection'

describe('ValuesSection', () => {
  it('renders the section heading', () => {
    render(<ValuesSection />)
    expect(screen.getByText('Designed to make a difference.')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<ValuesSection />)
    const heading = screen.getByText('Designed to make a difference.')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('renders 4 value cards', () => {
    render(<ValuesSection />)
    expect(screen.getByText('8 anos de garantia na bateria.')).toBeInTheDocument()
    expect(screen.getByText('Do quotidiano à escapadela.')).toBeInTheDocument()
    expect(screen.getByText('Carrega sem complicações.')).toBeInTheDocument()
    expect(screen.getByText('Sempre ligado, onde estiveres.')).toBeInTheDocument()
  })
})
```

Create `tests/components/sections/LeadSection.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/ui/ContactDrawer', () => ({
  __esModule: true,
  default: () => null,
}))

import LeadSection from '@/components/sections/LeadSection'

describe('LeadSection', () => {
  it('renders the section heading', () => {
    render(<LeadSection />)
    expect(screen.getByText('Ainda com dúvidas?')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<LeadSection />)
    const heading = screen.getByText('Ainda com dúvidas?')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })
})
```

- [ ] **Step 2: Add heading test to existing CTASection test**

In `tests/components/sections/CTASection.test.tsx`, add inside the `describe` block:

```tsx
it('applies --text-h2 CSS variable to the section heading', () => {
  render(<CTASection selectedVersion="engage" />)
  const heading = screen.getByText(/Reserva o teu Leaf hoje/i)
  expect(heading.style.fontSize).toBe('var(--text-h2)')
})
```

- [ ] **Step 3: Add heading test to existing ClosingSection test**

In `tests/components/sections/ClosingSection.test.tsx`, add inside the `describe` block:

```tsx
it('applies --text-h2 CSS variable to the heading', () => {
  const { container } = render(<ClosingSection />)
  const heading = container.querySelector('h2')!
  expect(heading.style.fontSize).toBe('var(--text-h2)')
})
```

- [ ] **Step 4: Add heading test to existing RangeSavings test**

In `tests/RangeSavings.test.tsx`, add inside the `describe` block:

```tsx
it('applies --text-h2 CSS variable to the heading', () => {
  render(<RangeSavings />)
  const heading = screen.getByText('Uma bateria que vai onde tu vais.')
  expect(heading.style.fontSize).toBe('var(--text-h2)')
})
```

- [ ] **Step 5: Run all failing tests**

```bash
npm test -- tests/components/sections/Highlights.test.tsx tests/components/sections/ValuesSection.test.tsx tests/components/sections/LeadSection.test.tsx tests/components/sections/CTASection.test.tsx tests/components/sections/ClosingSection.test.tsx tests/RangeSavings.test.tsx
```

Expected: the `--text-h2` tests FAIL; content/rendering tests may already PASS.

- [ ] **Step 6: Apply --text-h2 to Highlights**

In `src/components/sections/Highlights.tsx`, replace the `<motion.h2>` element:

```tsx
// Before
<motion.h2
  className="text-[56px] leading-none font-medium text-[#0A0A0A] tracking-[-0.07em]"
  ...
>

// After
<motion.h2
  className="leading-none font-medium text-[#0A0A0A] tracking-[-0.07em]"
  style={{ fontSize: 'var(--text-h2)' }}
  ...
>
```

- [ ] **Step 7: Apply --text-h2 to ValuesSection**

In `src/components/sections/ValuesSection.tsx`, replace the `<h2>` element (lines 145-148):

```tsx
// Before
<h2
  className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-none max-w-5xl"
  style={{ fontSize: '56px' }}
>

// After
<h2
  className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-none max-w-5xl"
  style={{ fontSize: 'var(--text-h2)' }}
>
```

- [ ] **Step 8: Apply --text-h2 to LeadSection**

In `src/components/sections/LeadSection.tsx`, replace the `<motion.h2>` element:

```tsx
// Before
<motion.h2
  className="text-[56px] leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-20"
  ...
>

// After
<motion.h2
  className="leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-10 md:mb-14 xl:mb-20"
  style={{ fontSize: 'var(--text-h2)' }}
  ...
>
```

- [ ] **Step 9: Apply --text-h2 to CTASection**

In `src/components/sections/CTASection.tsx`, replace the `<h2>` (line 44):

```tsx
// Before
<h2 className="text-[56px] leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-8">

// After
<h2 className="leading-none font-medium text-[#0A0A0A] tracking-[-0.07em] mb-8" style={{ fontSize: 'var(--text-h2)' }}>
```

- [ ] **Step 10: Apply --text-h2 to ClosingSection**

In `src/components/sections/ClosingSection.tsx`, replace the `<h2>` (line 49):

```tsx
// Before
<h2 className="text-[56px] leading-none font-medium text-white tracking-[-0.07em]">

// After
<h2 className="leading-none font-medium text-white tracking-[-0.07em]" style={{ fontSize: 'var(--text-h2)' }}>
```

- [ ] **Step 11: Apply --text-h2 to RangeSavings**

In `src/components/sections/RangeSavings.tsx`, replace the `<h2>` (line 84):

```tsx
// Before
<h2 className="text-4xl md:text-5xl mb-5 font-medium tracking-[-0.07em] leading-none">

// After
<h2 className="mb-5 font-medium tracking-[-0.07em] leading-none" style={{ fontSize: 'var(--text-h2)' }}>
```

- [ ] **Step 12: Run all tests**

```bash
npm test -- tests/components/sections/Highlights.test.tsx tests/components/sections/ValuesSection.test.tsx tests/components/sections/LeadSection.test.tsx tests/components/sections/CTASection.test.tsx tests/components/sections/ClosingSection.test.tsx tests/RangeSavings.test.tsx
```

Expected: all PASS.

- [ ] **Step 13: Commit**

```bash
git add src/components/sections/Highlights.tsx src/components/sections/ValuesSection.tsx src/components/sections/LeadSection.tsx src/components/sections/CTASection.tsx src/components/sections/ClosingSection.tsx src/components/sections/RangeSavings.tsx tests/components/sections/Highlights.test.tsx tests/components/sections/ValuesSection.test.tsx tests/components/sections/LeadSection.test.tsx tests/components/sections/CTASection.test.tsx tests/components/sections/ClosingSection.test.tsx tests/RangeSavings.test.tsx
git commit -m "feat: apply --text-h2 fluid typography to all section headings"
```

---

## Task 4: Section vertical spacing

**Files:**
- Modify: `src/components/sections/Highlights.tsx`
- Modify: `src/components/sections/ValuesSection.tsx`
- Modify: `src/components/sections/LeadSection.tsx`
- Modify: `src/components/sections/CTASection.tsx`

No new tests — spacing classes are visual and don't change component behaviour covered by existing tests.

- [ ] **Step 1: Update Highlights section padding and title margin**

In `src/components/sections/Highlights.tsx`:

```tsx
// Section element — Before
<section id="highlights" className="pt-48 pb-48 bg-white overflow-hidden">

// Section element — After
<section id="highlights" className="pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48 bg-white overflow-hidden">
```

```tsx
// Title wrapper — Before
<div className="max-w-5xl mx-auto px-6 mb-20">

// Title wrapper — After
<div className="max-w-5xl mx-auto px-6 mb-10 md:mb-14 xl:mb-20">
```

- [ ] **Step 2: Update ValuesSection section padding and title margin**

In `src/components/sections/ValuesSection.tsx`:

```tsx
// Section element — Before
<section id="values" className="pt-48 pb-48 bg-white overflow-hidden">

// Section element — After
<section id="values" className="pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48 bg-white overflow-hidden">
```

```tsx
// Title wrapper — Before
<div className="max-w-5xl mx-auto px-6 mb-20 text-center">

// Title wrapper — After
<div className="max-w-5xl mx-auto px-6 mb-10 md:mb-14 xl:mb-20 text-center">
```

- [ ] **Step 3: Update LeadSection section padding**

In `src/components/sections/LeadSection.tsx`:

```tsx
// Before
<section id="contacto" className="bg-white pt-48 pb-48">

// After
<section id="contacto" className="bg-white pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48">
```

- [ ] **Step 4: Update CTASection section padding**

In `src/components/sections/CTASection.tsx`:

```tsx
// Before
<section id="reservar" className="bg-white pt-48 pb-48">

// After
<section id="reservar" className="bg-white pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48">
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all PASS (no test changes needed).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Highlights.tsx src/components/sections/ValuesSection.tsx src/components/sections/LeadSection.tsx src/components/sections/CTASection.tsx
git commit -m "feat: add responsive section spacing (mobile-first pt/pb scale)"
```

---

## Task 5: SiteHeader responsive padding

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`
- Modify: `tests/components/layout/SiteHeader.test.tsx`

- [ ] **Step 1: Write failing test**

In `tests/components/layout/SiteHeader.test.tsx`, add inside the `describe` block:

```tsx
it('header does not use hardcoded inline padding', () => {
  render(<SiteHeader />)
  const header = screen.getByRole('banner')
  expect(header.style.paddingLeft).not.toBe('64px')
  expect(header.style.paddingRight).not.toBe('64px')
})

it('header has responsive padding classes', () => {
  render(<SiteHeader />)
  const header = screen.getByRole('banner')
  expect(header.className).toContain('px-6')
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/components/layout/SiteHeader.test.tsx
```

Expected: 2 new tests FAIL.

- [ ] **Step 3: Update SiteHeader**

Replace `src/components/layout/SiteHeader.tsx`:

```tsx
'use client'
import Image from 'next/image'

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function SiteHeader() {
  return (
    <div className="absolute left-0 right-0 top-6 z-50 pointer-events-none">
      <header
        className="mx-auto flex items-center justify-between pointer-events-auto px-6 md:px-10 lg:px-16"
        style={{
          width: '100%',
          height: '64px',
          background: 'transparent',
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
      </header>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/layout/SiteHeader.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/SiteHeader.tsx tests/components/layout/SiteHeader.test.tsx
git commit -m "feat: replace SiteHeader hardcoded 64px padding with responsive Tailwind classes"
```

---

## Task 6: Hero headline mobile steps

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `tests/Hero.test.tsx`

- [ ] **Step 1: Write failing test**

In `tests/Hero.test.tsx`, add inside the `describe` block:

```tsx
it('h1 has mobile-first text size class (text-3xl)', () => {
  render(<Hero />)
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading.className).toContain('text-3xl')
})
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/Hero.test.tsx
```

Expected: new test FAILS (h1 currently has `text-5xl` as smallest class).

- [ ] **Step 3: Update Hero h1**

In `src/components/sections/Hero.tsx`, replace the `<motion.h1>` className:

```tsx
// Before
<motion.h1
  className="font-medium text-5xl md:text-6xl lg:text-7xl text-white leading-none tracking-[-0.07em]"

// After
<motion.h1
  className="font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-none tracking-[-0.07em]"
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/Hero.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.tsx tests/Hero.test.tsx
git commit -m "feat: extend Hero headline with mobile-first responsive text steps"
```

---

## Task 7: HighlightCard mobile layout

**Files:**
- Modify: `src/components/ui/HighlightCard.tsx`
- Create: `tests/components/ui/HighlightCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/ui/HighlightCard.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import HighlightCard from '@/components/ui/HighlightCard'

const defaultProps = {
  imageSrc: '/test.jpg',
  imageAlt: 'Test image',
  description: 'Test description text',
  textPosition: 'bottom' as const,
}

describe('HighlightCard', () => {
  it('renders the image', () => {
    render(<HighlightCard {...defaultProps} />)
    expect(screen.getByAltText('Test image')).toBeInTheDocument()
  })

  it('renders a mobile text block with the description', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    // Mobile block has both 'block' and 'md:hidden' classes
    const mobileBlock = container.querySelector('.block.md\\:hidden')
    expect(mobileBlock).toBeInTheDocument()
    expect(mobileBlock).toHaveTextContent('Test description text')
  })

  it('renders a desktop overlay that is hidden on mobile', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    // Desktop overlay has both 'hidden' and 'md:block' classes
    const desktopOverlay = container.querySelector('.hidden.md\\:block')
    expect(desktopOverlay).toBeInTheDocument()
  })

  it('desktop overlay contains the description', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    const desktopOverlay = container.querySelector('.hidden.md\\:block')
    expect(desktopOverlay).toHaveTextContent('Test description text')
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/components/ui/HighlightCard.test.tsx
```

Expected: the mobile block and desktop overlay tests FAIL (structure doesn't exist yet).

- [ ] **Step 3: Update HighlightCard**

Replace `src/components/ui/HighlightCard.tsx`:

```tsx
import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  description: string
  textPosition: 'top' | 'middle' | 'bottom'
}

const overlayClasses = {
  top: 'bg-gradient-to-b from-black/65 via-black/20 to-transparent',
  middle: 'bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(0,0,0,0.6)_0%,transparent_100%)]',
  bottom: 'bg-gradient-to-t from-black/70 via-black/25 to-transparent',
}

const positionClasses = {
  top: 'absolute top-7 left-7 md:top-10 md:left-10',
  middle: 'absolute top-1/2 -translate-y-1/2 left-7 md:left-10',
  bottom: 'absolute bottom-7 left-7 md:bottom-10 md:left-10',
}

export default function HighlightCard({
  imageSrc,
  imageAlt,
  description,
  textPosition,
}: HighlightCardProps) {
  return (
    <div className="w-full flex flex-col select-none">
      {/* Image container */}
      <div className="w-full aspect-[8/5] rounded-2xl overflow-hidden relative">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />

        {/* Gradient overlay — desktop only */}
        <div className={`absolute inset-0 pointer-events-none hidden md:block ${overlayClasses[textPosition]}`} />

        {/* Text overlay — desktop only */}
        <div className={`hidden md:block ${positionClasses[textPosition]} max-w-[60%] lg:max-w-[50%] pointer-events-none`}>
          <p className="text-base md:text-xl lg:text-2xl font-medium text-white leading-snug tracking-[-0.02em]">
            {description}
          </p>
        </div>
      </div>

      {/* Text below image — mobile only */}
      <div className="block md:hidden mt-3 px-1">
        <p className="text-base font-medium text-[#0A0A0A] leading-snug tracking-[-0.02em]">
          {description}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/ui/HighlightCard.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/HighlightCard.tsx tests/components/ui/HighlightCard.test.tsx
git commit -m "feat: HighlightCard shows text below image on mobile, overlay preserved on md+"
```

---

## Task 8: Highlights carousel — mobile peek divisor

**Files:**
- Modify: `src/components/sections/Highlights.tsx`
- Modify: `tests/components/sections/Highlights.test.tsx`

- [ ] **Step 1: Add structural test for carousel**

In `tests/components/sections/Highlights.test.tsx`, add:

```tsx
it('renders pagination controls', () => {
  render(<Highlights />)
  expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Próximo/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it passes (no implementation needed for this)**

```bash
npm test -- tests/components/sections/Highlights.test.tsx
```

Expected: all PASS (pagination buttons already exist).

- [ ] **Step 3: Update cardWidth divisor in Highlights**

In `src/components/sections/Highlights.tsx`, replace the `cardWidth` constant (currently line 56):

```ts
// Before
const cardWidth = viewportWidth > 0 ? Math.round((viewportWidth - containerLeft - GAP) / 1.5) : 0

// After
const divisor = viewportWidth >= 768 ? 1.5 : 1.25
const cardWidth = viewportWidth > 0 ? Math.round((viewportWidth - containerLeft - GAP) / divisor) : 0
```

- [ ] **Step 4: Run all tests**

```bash
npm test -- tests/components/sections/Highlights.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Highlights.tsx tests/components/sections/Highlights.test.tsx
git commit -m "feat: reduce Highlights carousel peek on mobile (divisor 1.25 < 768px)"
```

---

## Task 9: ValuesSection — dynamic card width

**Files:**
- Modify: `src/components/sections/ValuesSection.tsx`
- Modify: `tests/components/sections/ValuesSection.test.tsx`

- [ ] **Step 1: Add structural test for carousel**

In `tests/components/sections/ValuesSection.test.tsx`, add:

```tsx
it('renders pagination controls', () => {
  render(<ValuesSection />)
  expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Próximo/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test**

```bash
npm test -- tests/components/sections/ValuesSection.test.tsx
```

Expected: all PASS.

- [ ] **Step 3: Replace static card dimensions with viewport-responsive values**

In `src/components/sections/ValuesSection.tsx`, make the following changes:

**Remove the static constants** (lines 11-12):
```ts
// Remove these two lines entirely:
const CARD_HEIGHT  = 480
const CARD_WIDTH   = Math.round(CARD_HEIGHT * 16 / 9)  // 853
```

**Add `cardWidth` and `cardHeight` as derived values** inside the component, after the `containerLeft` declaration. The `containerLeft` is already computed from `viewportWidth`, so `cardWidth`/`cardHeight` can derive from it:

```ts
// After the containerLeft line, add:
const cardWidth = viewportWidth > 0
  ? viewportWidth >= 768
    ? Math.min(Math.round((viewportWidth - containerLeft - GAP) / 1.5), 853)
    : Math.round((viewportWidth - containerLeft - GAP) / 1.25)
  : 853
const cardHeight = Math.round(cardWidth * 9 / 16)
```

**Update `getOffset`** to use `cardWidth` instead of `CARD_WIDTH`:
```ts
function getOffset(index: number): number {
  return containerLeft - index * (cardWidth + GAP)
}
```

**Update `handlePointerUp`** swipe threshold:
```ts
// Before
} else if (Math.abs(delta) > CARD_WIDTH / 4) {

// After
} else if (Math.abs(delta) > cardWidth / 4) {
```

**Update the JSX** — `ValuesCard` already receives `width` and `height` props, just use the new variables:
```tsx
// Before
<ValuesCard
  ...
  width={CARD_WIDTH}
  height={CARD_HEIGHT}
/>

// After
<ValuesCard
  ...
  width={cardWidth}
  height={cardHeight}
/>
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/sections/ValuesSection.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ValuesSection.tsx tests/components/sections/ValuesSection.test.tsx
git commit -m "feat: ValuesSection card width now viewport-responsive (replaces fixed 853px)"
```

---

## Task 10: BottomCTABar — gap + safe-area bottom

**Files:**
- Modify: `src/components/ui/BottomCTABar.tsx`
- Modify: `tests/components/ui/BottomCTABar.test.tsx`

- [ ] **Step 1: Write failing tests**

In `tests/components/ui/BottomCTABar.test.tsx`, add inside the `describe` block:

```tsx
it('inner pill has gap-4 class for mobile', () => {
  setupAnchors()
  const { container } = render(<BottomCTABar />)
  const pill = container.querySelector('.gap-4')
  expect(pill).toBeInTheDocument()
})

it('outer wrapper uses safe-area-inset-bottom for bottom positioning', () => {
  setupAnchors()
  const { container } = render(<BottomCTABar />)
  const bar = container.firstChild as HTMLElement
  expect(bar.style.bottom).toContain('safe-area-inset-bottom')
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/components/ui/BottomCTABar.test.tsx
```

Expected: 2 new tests FAIL.

- [ ] **Step 3: Update BottomCTABar**

In `src/components/ui/BottomCTABar.tsx`, make two changes:

1. Remove `bottom-8` from the outer `<div>` className and add an inline style:

```tsx
// Before
<div
  className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'opacity-100'}`}
  aria-hidden={hidden ? 'true' : undefined}
>

// After
<div
  className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'opacity-100'}`}
  style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
  aria-hidden={hidden ? 'true' : undefined}
>
```

2. Change `gap-24` to `gap-4 md:gap-24` on the inner pill div:

```tsx
// Before
<div className="flex items-center gap-24 bg-[#3A3A3C]/95 backdrop-blur-md rounded-full pl-7 pr-2.5 py-2.5 shadow-2xl">

// After
<div className="flex items-center gap-4 md:gap-24 bg-[#3A3A3C]/95 backdrop-blur-md rounded-full pl-7 pr-2.5 py-2.5 shadow-2xl">
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/ui/BottomCTABar.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx tests/components/ui/BottomCTABar.test.tsx
git commit -m "feat: BottomCTABar responsive gap and safe-area bottom positioning"
```

---

## Task 11: ContactForm responsive grid

**Files:**
- Modify: `src/components/forms/ContactForm.tsx`
- Create: `tests/components/forms/ContactForm.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/components/forms/ContactForm.test.tsx`:

```tsx
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import ContactForm from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('name fields grid has grid-cols-1 for mobile layout', () => {
    const { container } = render(<ContactForm />)
    const grid = container.querySelector('.grid-cols-1')
    expect(grid).toBeInTheDocument()
  })

  it('name fields grid has md:grid-cols-2 for tablet+ layout', () => {
    const { container } = render(<ContactForm />)
    // class "md:grid-cols-2" contains a colon — escape it in the selector
    const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- tests/components/forms/ContactForm.test.tsx
```

Expected: both tests FAIL (grid is currently `grid-cols-2`).

- [ ] **Step 3: Update ContactForm**

In `src/components/forms/ContactForm.tsx`, change line 41:

```tsx
// Before
<div className="grid grid-cols-2 gap-4">

// After
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/forms/ContactForm.test.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/ContactForm.tsx tests/components/forms/ContactForm.test.tsx
git commit -m "feat: ContactForm name grid stacks to single column on mobile"
```

---

## Task 12: Drawers — safe-area bottom padding

**Files:**
- Modify: `src/components/ui/ContactDrawer.tsx`
- Modify: `src/components/ui/ReservationDrawer.tsx`
- Modify: `tests/components/ui/ReservationDrawer.test.tsx`
- Create: `tests/components/ui/ContactDrawer.test.tsx`

- [ ] **Step 1: Write failing test for ReservationDrawer**

In `tests/components/ui/ReservationDrawer.test.tsx`, add inside the `describe` block:

```tsx
it('scroll body has safe-area bottom padding', async () => {
  await act(async () => {
    render(<ReservationDrawer {...defaultProps} isOpen />)
  })
  // The scrollable body div has pb-[env(safe-area-inset-bottom)]
  const bodies = document.querySelectorAll('[class*="overflow-y-auto"]')
  const body = Array.from(bodies).find(el => el.className.includes('safe-area-inset-bottom'))
  expect(body).toBeInTheDocument()
})
```

- [ ] **Step 2: Write failing test for ContactDrawer**

Create `tests/components/ui/ContactDrawer.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/forms/ContactForm', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'contact-form' }),
}))

import ContactDrawer from '@/components/ui/ContactDrawer'

describe('ContactDrawer', () => {
  it('renders the drawer title when open', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    expect(screen.getByText('Pedir informações')).toBeInTheDocument()
  })

  it('renders the contact form when open', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
  })

  it('scroll body has safe-area bottom padding', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    const bodies = document.querySelectorAll('[class*="overflow-y-auto"]')
    const body = Array.from(bodies).find(el => el.className.includes('safe-area-inset-bottom'))
    expect(body).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ContactDrawer isOpen onClose={onClose} />)
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ContactDrawer isOpen onClose={onClose} />)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 3: Run failing tests**

```bash
npm test -- tests/components/ui/ReservationDrawer.test.tsx tests/components/ui/ContactDrawer.test.tsx
```

Expected: the safe-area tests FAIL; content/behaviour tests may already PASS.

- [ ] **Step 4: Update ContactDrawer scroll body**

In `src/components/ui/ContactDrawer.tsx`, update the body div (line 69):

```tsx
// Before
<div className="flex-1 overflow-y-auto px-6 py-6">

// After
<div className="flex-1 overflow-y-auto px-6 py-6 pb-[env(safe-area-inset-bottom)]">
```

- [ ] **Step 5: Update ReservationDrawer scroll body**

In `src/components/ui/ReservationDrawer.tsx`, update the body div (line 86):

```tsx
// Before
<div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

// After
<div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-[env(safe-area-inset-bottom)]">
```

- [ ] **Step 6: Run all tests**

```bash
npm test -- tests/components/ui/ReservationDrawer.test.tsx tests/components/ui/ContactDrawer.test.tsx
```

Expected: all PASS.

- [ ] **Step 7: Run the full test suite**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ContactDrawer.tsx src/components/ui/ReservationDrawer.tsx tests/components/ui/ReservationDrawer.test.tsx tests/components/ui/ContactDrawer.test.tsx
git commit -m "feat: add safe-area bottom padding to drawer scroll bodies"
```

---

## Self-Review Checklist

After all tasks complete, verify against the spec:

- [ ] CSS vars `--text-display` and `--text-h2` in globals.css ✓ Task 1
- [ ] `viewportFit: 'cover'` in layout.tsx ✓ Task 1
- [ ] DesignIntroSection: `--text-display`, no `min-w-[900px]`, eyebrow `text-base md:text-xl` ✓ Task 2
- [ ] AutonomiaSectionV2: `--text-display`, eyebrow `text-base md:text-xl` ✓ Task 2
- [ ] All 6 section h2s use `--text-h2` ✓ Task 3
- [ ] RangeSavings h2 consistent with others ✓ Task 3
- [ ] Highlights + ValuesSection + LeadSection + CTASection responsive padding ✓ Task 4
- [ ] SiteHeader: no inline 64px padding, uses `px-6 md:px-10 lg:px-16` ✓ Task 5
- [ ] Hero: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl` ✓ Task 6
- [ ] HighlightCard: text below image on `< md`, overlay on `md+` ✓ Task 7
- [ ] Highlights: divisor `1.25` on mobile, `1.5` on `md+` ✓ Task 8
- [ ] ValuesSection: dynamic `cardWidth`/`cardHeight`, cap 853 on desktop ✓ Task 9
- [ ] BottomCTABar: `gap-4 md:gap-24`, safe-area bottom ✓ Task 10
- [ ] ContactForm: `grid-cols-1 md:grid-cols-2` ✓ Task 11
- [ ] Both drawers: `pb-[env(safe-area-inset-bottom)]` on scroll body ✓ Task 12
