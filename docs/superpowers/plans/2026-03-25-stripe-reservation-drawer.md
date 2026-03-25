# Stripe Reservation Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-to-section reservation flow with a left-sliding drawer that opens from the configurator, shows the current configuration summary, and hosts the Stripe payment form.

**Architecture:** A new `ReservationDrawer` component (mirrors `ContactDrawer` but slides from the left, overlay non-interactive) is rendered inside `Configurador`. `Configurador` gains local `isDrawerOpen` state and drops its `onSelectVersion` prop. The legacy `Configurator` component and `CTASection` (the old `#reservar` section) are removed from the page.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, `@stripe/react-stripe-js`, React Testing Library + Jest (tests live in `tests/`)

**Spec:** `docs/superpowers/specs/2026-03-25-stripe-reservation-drawer-design.md`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/ui/ReservationDrawer.tsx` | Left-sliding drawer: config card + Stripe form |
| Create | `tests/components/ui/ReservationDrawer.test.tsx` | Tests for ReservationDrawer |
| Modify | `src/components/sections/Configurador.tsx` | Add drawer state + open handler; drop `onSelectVersion` prop |
| Modify | `tests/Configurador.test.tsx` | Update for removed prop + new drawer behaviour |
| Modify | `src/components/sections/ClosingSection.tsx` | Change "Reservar" scroll target to `#configurador` |
| Modify | `src/app/page.tsx` | Remove `<Configurator>`, `<CTASection>`, `selectedVersion` state |
| Delete | `tests/components/sections/CTASection.test.tsx` | No longer needed |
| Delete | `tests/components/sections/Configurator.test.tsx` | No longer needed |

---

## Task 1: Create `ReservationDrawer` component

**Files:**
- Create: `src/components/ui/ReservationDrawer.tsx`
- Create: `tests/components/ui/ReservationDrawer.test.tsx`

---

- [ ] **Step 1.1: Write the failing tests**

Create `tests/components/ui/ReservationDrawer.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock StripePaymentForm to avoid real network calls
jest.mock('@/components/forms/StripePaymentForm', () => ({
  __esModule: true,
  default: ({ versionId }: { versionId?: string }) => (
    <div data-testid="stripe-payment-form" data-version-id={versionId} />
  ),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import ReservationDrawer from '@/components/ui/ReservationDrawer'

const DEFAULT_PROPS = {
  isOpen: false,
  onClose: jest.fn(),
  versionId: 'n-connecta',
  versionName: 'N-Connecta',
  colorName: 'Turquoise',
  colorImageSrc: '/images/exterior-colors/TURQUOISE.png',
  price: 34490,
}

describe('ReservationDrawer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ReservationDrawer {...DEFAULT_PROPS} isOpen={false} />
    )
    expect(screen.queryByText('Reserva')).not.toBeInTheDocument()
    expect(screen.queryByTestId('stripe-payment-form')).not.toBeInTheDocument()
  })

  it('renders the drawer header when isOpen is true', () => {
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />)
    expect(screen.getByText('Reserva')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument()
  })

  it('renders config card with vehicle info when open', () => {
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
    expect(screen.getByText('N-Connecta')).toBeInTheDocument()
    expect(screen.getByText(/Turquoise/)).toBeInTheDocument()
    // Price rendered with pt-PT locale (non-breaking space as thousands separator)
    expect(screen.getByText(/34/)).toBeInTheDocument()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/images/exterior-colors/TURQUOISE.png')
  })

  it('renders the intro title and Stripe form when open', () => {
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />)
    expect(screen.getByText(/Complete a sua reserva/i)).toBeInTheDocument()
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()
  })

  it('passes versionId to StripePaymentForm', () => {
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />)
    const form = screen.getByTestId('stripe-payment-form')
    expect(form).toHaveAttribute('data-version-id', 'n-connecta')
  })

  it('calls onClose when ESC key is pressed', () => {
    const onClose = jest.fn()
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} onClose={onClose} />)
    const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll when open and restores when closed', () => {
    const { rerender } = render(
      <ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<ReservationDrawer {...DEFAULT_PROPS} isOpen={false} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('does not mount StripePaymentForm when closed', () => {
    render(<ReservationDrawer {...DEFAULT_PROPS} isOpen={false} />)
    expect(screen.queryByTestId('stripe-payment-form')).not.toBeInTheDocument()
  })

  it('re-mounts StripePaymentForm on each open', () => {
    const { rerender } = render(
      <ReservationDrawer {...DEFAULT_PROPS} isOpen={true} />
    )
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()

    rerender(<ReservationDrawer {...DEFAULT_PROPS} isOpen={false} />)
    expect(screen.queryByTestId('stripe-payment-form')).not.toBeInTheDocument()

    rerender(<ReservationDrawer {...DEFAULT_PROPS} isOpen={true} versionId="tekna" />)
    const form = screen.getByTestId('stripe-payment-form')
    expect(form).toHaveAttribute('data-version-id', 'tekna')
  })
})
```

Note: the `import ReservationDrawer` line is intentionally missing — add it after creating the component file.

- [ ] **Step 1.2: Run tests to confirm they fail**

```bash
npx jest tests/components/ui/ReservationDrawer.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/ui/ReservationDrawer'`

- [ ] **Step 1.3: Create `ReservationDrawer.tsx`**

Create `src/components/ui/ReservationDrawer.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

interface ReservationDrawerProps {
  isOpen: boolean
  onClose: () => void
  versionId: string
  versionName: string
  colorName: string
  colorImageSrc: string
  price: number
}

export default function ReservationDrawer({
  isOpen,
  onClose,
  versionId,
  versionName,
  colorName,
  colorImageSrc,
  price,
}: ReservationDrawerProps) {
  const [mounted, setMounted] = useState(false)

  // SSR guard — only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key — only active when drawer is open
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Glass overlay — decorative only, not interactive */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full md:w-[420px] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-medium text-[#0A0A0A]">Reserva</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#0A0A0A]/40 hover:text-[#0A0A0A] text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Config card */}
          <div className="flex items-start gap-4 border border-gray-100 rounded-xl p-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={colorImageSrc}
                alt={colorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#0A0A0A]">Nissan Leaf</span>
              <span className="text-sm text-[#86868b]">{versionName}</span>
              <span className="text-sm text-[#86868b]">
                {colorName} · €{price.toLocaleString('pt-PT')}
              </span>
            </div>
          </div>

          {/* Intro + form */}
          <p className="text-base font-medium text-[#0A0A0A]">Complete a sua reserva</p>

          {isOpen && <StripePaymentForm versionId={versionId} />}
        </div>
      </div>
    </>,
    document.body
  )
}
```

- [ ] **Step 1.4: Run tests to confirm they pass**

```bash
npx jest tests/components/ui/ReservationDrawer.test.tsx --no-coverage
```

Expected: all tests PASS

- [ ] **Step 1.5: Commit**

```bash
git add src/components/ui/ReservationDrawer.tsx tests/components/ui/ReservationDrawer.test.tsx
git commit -m "feat: add ReservationDrawer with config card and Stripe form"
```

---

## Task 2: Wire `Configurador` to open `ReservationDrawer`

**Files:**
- Modify: `src/components/sections/Configurador.tsx`
- Modify: `tests/Configurador.test.tsx`

---

- [ ] **Step 2.1: Write failing tests for the new Configurador behaviour**

Replace the content of `tests/Configurador.test.tsx` with:

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, fill, priority, sizes, quality, placeholder, blurDataURL, onLoad, onError, ...props }: { alt: string; fill?: boolean; priority?: boolean; sizes?: string; quality?: number; placeholder?: string; blurDataURL?: string; onLoad?: () => void; onError?: () => void; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/configurator/Canvas360Viewer', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'canvas-360-viewer' }),
}))

// Mock ReservationDrawer to keep tests focused on Configurador
jest.mock('@/components/ui/ReservationDrawer', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="reservation-drawer"><button onClick={onClose}>Fechar</button></div> : null
  ),
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

import Configurador from '@/components/sections/Configurador'

describe('Configurador', () => {
  it('renders with id="configurador"', () => {
    const { container } = render(<Configurador />)
    expect(container.querySelector('#configurador')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<Configurador />)
    expect(screen.getByText('Reserve o Nissan Leaf à medida da sua energia.')).toBeInTheDocument()
  })

  it('renders all 3 version buttons', () => {
    render(<Configurador />)
    expect(screen.getByText('Visia')).toBeInTheDocument()
    expect(screen.getAllByText('N-Connecta').length).toBeGreaterThan(0)
    expect(screen.getByText('Tekna')).toBeInTheDocument()
  })

  it('renders the Reservar agora CTA button', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /reservar agora/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders the Vista 360 button', () => {
    render(<Configurador />)
    expect(screen.getByRole('button', { name: /vista 360/i })).toBeInTheDocument()
  })

  it('clicking Vista 360 shows the 360 viewer', () => {
    render(<Configurador />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  })

  it('clicking a color while in 360 view closes the 360 viewer', () => {
    render(<Configurador />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    fireEvent.click(screen.getByRole('radio', { name: /fuji sunset red/i }))
    expect(screen.queryByTestId('canvas-360-viewer')).not.toBeInTheDocument()
  })

  it('clicking Reservar agora opens the ReservationDrawer', () => {
    render(<Configurador />)
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
    const button = screen.getAllByRole('button', { name: /reservar agora/i })[0]
    fireEvent.click(button)
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
  })

  it('closing the ReservationDrawer hides it', () => {
    render(<Configurador />)
    fireEvent.click(screen.getAllByRole('button', { name: /reservar agora/i })[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Run tests to confirm they fail**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: FAIL — `Configurador` still has `onSelectVersion` prop required, and `handleReserve` still scrolls

- [ ] **Step 2.3: Update `Configurador.tsx`**

In `src/components/sections/Configurador.tsx`, make these changes:

1. Remove the `ConfiguradorProps` interface and the `onSelectVersion` prop entirely.
2. Add `ReservationDrawer` import.
3. Add `isDrawerOpen` state.
4. Replace `handleReserve` to set `isDrawerOpen(true)`.
5. Render `<ReservationDrawer>` inside the section's return.

The updated file:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import ReservationDrawer from '@/components/ui/ReservationDrawer'
import { VERSIONS, EXTERIOR_COLORS } from '@/components/configurator/configuradorData'

export default function Configurador() {
  const [selectedVersionId, setSelectedVersionId] = useState('visia')
  const [selectedColorId, setSelectedColorId] = useState('TURQUOISE')
  const [imageView, setImageView] = useState<'exterior' | 'interior' | '360'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Scroll-pin refs — all mutations go straight to the DOM, no re-renders needed
  const sectionRef  = useRef<HTMLElement>(null)
  const clipRef     = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const overflowRef = useRef(0)

  function handleVersionSelect(id: string) {
    setSelectedVersionId(id)
  }

  function handleColorSelect(id: string) {
    if (imageView === '360') setImageView('exterior')
    setSelectedColorId(id)
  }

  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[0]
  const activeColor   = EXTERIOR_COLORS.find(c => c.id === selectedColorId) ?? EXTERIOR_COLORS[0]

  function handleReserve() {
    setIsDrawerOpen(true)
  }

  useEffect(() => {
    const section = sectionRef.current
    const clip    = clipRef.current
    const content = contentRef.current
    if (!section || !clip || !content) return

    function measure() {
      if (window.innerWidth < 768) {
        section!.style.height = ''
        content!.style.transform = ''
        overflowRef.current = 0
        return
      }
      const overflow = Math.max(0, content!.scrollHeight - clip!.clientHeight)
      overflowRef.current = overflow
      section!.style.height = `calc(100vh + ${overflow}px)`
      onScroll()
    }

    function onScroll() {
      if (window.innerWidth < 768) return
      const scrolledIn = Math.max(0, -section!.getBoundingClientRect().top)
      const clamped    = Math.min(scrolledIn, overflowRef.current)
      content!.style.transform = `translateY(-${clamped}px)`
    }

    const ro = new ResizeObserver(measure)
    ro.observe(content)
    measure()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section ref={sectionRef} id="configurador" className="relative bg-white">

      {/* Viewport frame: sticky on desktop, natural flow on mobile */}
      <div className="overflow-hidden flex flex-col md:flex-row md:sticky md:top-0 md:h-screen">

        {/* Left — image panel */}
        <div className="w-full md:w-[65%] h-[50vh] md:h-full">
          <ImagePanel
            exteriorImageSrc={activeColor.imageSrc}
            view={imageView}
            onViewChange={setImageView}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        </div>

        {/* Right — clip area + CTA */}
        <div className="w-full md:w-[35%] md:h-full flex flex-col">

          {/* Clip window */}
          <div ref={clipRef} className="flex-1 overflow-hidden relative">
            <div ref={contentRef} className="md:absolute md:top-0 md:left-0 md:right-0 md:will-change-transform">
              <OptionsPanel
                selectedVersionId={selectedVersionId}
                selectedColorId={selectedColorId}
                onSelectVersion={handleVersionSelect}
                onSelectColor={handleColorSelect}
              />
            </div>
          </div>

          {/* CTA bar */}
          <div className="border-t border-gray-100 bg-white px-8 py-5">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-[#86868b]">Nissan Leaf {activeVersion.name}</span>
                <span className="text-lg font-semibold text-[#0A0A0A]">
                  €{activeVersion.price.toLocaleString('pt-PT')}
                </span>
              </div>
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-normal text-lg px-6 py-3 rounded-lg hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A0A0A]">{activeVersion.name}</span>
                <span className="text-sm text-[#86868b]">€{activeVersion.price.toLocaleString('pt-PT')}</span>
              </div>
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-normal text-lg py-3 rounded-lg hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>
          </div>

        </div>
      </div>

      <ReservationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        versionId={activeVersion.id}
        versionName={activeVersion.name}
        colorName={activeColor.name}
        colorImageSrc={activeColor.imageSrc}
        price={activeVersion.price}
      />

    </section>
  )
}
```

- [ ] **Step 2.4: Run tests to confirm they pass**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: all tests PASS

- [ ] **Step 2.5: Commit**

```bash
git add src/components/sections/Configurador.tsx tests/Configurador.test.tsx
git commit -m "feat: open ReservationDrawer from Configurador; drop onSelectVersion prop"
```

---

## Task 3: Update `ClosingSection` scroll target

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx`

---

- [ ] **Step 3.1: Update `ClosingSection.tsx`**

In `src/components/sections/ClosingSection.tsx`, find the "Reservar agora" button's `onClick` handler (line 84):

```tsx
onClick={() => scrollTo('reservar')}
```

Change it to:

```tsx
onClick={() => scrollTo('configurador')}
```

- [ ] **Step 3.2: Run the full test suite to confirm no regressions**

```bash
npx jest --no-coverage
```

Expected: all tests PASS

- [ ] **Step 3.3: Commit**

```bash
git add src/components/sections/ClosingSection.tsx
git commit -m "fix: Reservar agora in ClosingSection scrolls to #configurador"
```

---

## Task 4: Remove legacy components and stale tests from `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `tests/components/sections/CTASection.test.tsx`
- Delete: `tests/components/sections/Configurator.test.tsx`

---

- [ ] **Step 4.1: Update `page.tsx`**

Replace the contents of `src/app/page.tsx` with:

```tsx
'use client'
import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import DesignIntroSection from '@/components/sections/DesignIntroSection'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  return (
    <main className="pb-24 md:pb-20">
      <div className="h-screen flex flex-col">
        <SiteHeader />
        <Hero />
      </div>
      <Highlights />
      <DesignIntroSection />
      <ValuesSection />
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurador />
      <ClosingSection />
    </main>
  )
}
```

- [ ] **Step 4.2: Delete stale test files**

```bash
rm tests/components/sections/CTASection.test.tsx
rm tests/components/sections/Configurator.test.tsx
```

- [ ] **Step 4.3: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS (no references to deleted files)

- [ ] **Step 4.4: Commit**

```bash
git add src/app/page.tsx
git add -u tests/components/sections/CTASection.test.tsx tests/components/sections/Configurator.test.tsx
git commit -m "chore: remove legacy Configurator and CTASection from page; delete stale tests"
```

---

## Final verification

- [ ] **Step 5.1: Run the full test suite one last time**

```bash
npx jest --no-coverage
```

Expected: all tests PASS, no skipped or failing

- [ ] **Step 5.2: Build check**

```bash
npx next build
```

Expected: build succeeds with no TypeScript or module errors
