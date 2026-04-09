# Expandable CTA Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `BottomCTABar` from a single "Configurar" pill into an expandable panel with "Reservar agora" as the primary CTA and a chevron that reveals two additional options.

**Architecture:** The `BottomCTABar` component manages a new `isExpanded` boolean state. The pill morphs in-place using `max-height` + `opacity` CSS transitions — no external animation library. Opening the reservation drawer from the bar requires a new custom event (`ctabar:reserve`) that `Configurador` listens for and responds to by opening its internal drawer.

**Tech Stack:** React, Tailwind CSS, custom DOM events, `@testing-library/react`

---

## File Map

| File | Change |
|---|---|
| `src/components/ui/BottomCTABar.tsx` | Full rework — new state, layout, animation, accessibility |
| `src/components/sections/Configurador.tsx` | Add `useEffect` listener for `ctabar:reserve` event |
| `tests/components/ui/BottomCTABar.test.tsx` | Update/add tests for new behaviour |

---

## Task 1: Update tests to cover new behaviour

**Files:**
- Modify: `tests/components/ui/BottomCTABar.test.tsx`

- [ ] **Step 1: Replace the "renders the Configurar button" test and add new ones**

Open `tests/components/ui/BottomCTABar.test.tsx`. Replace the existing `'renders the Configurar button'` test (line 63-67) and the `'scrolls to #configurador when button is clicked'` test (lines 195-210) entirely, and append new tests at the bottom of the `describe` block. The final describe block should contain all existing tests except those two, plus these new ones:

```tsx
  // ── CTA bar – collapsed state ─────────────────────────────────────────────

  it('renders the "Reservar agora" main CTA button when collapsed', () => {
    setupAnchors()
    render(<BottomCTABar />)
    const btn = screen.getByRole('button', { name: /reservar agora/i, hidden: true })
    expect(btn).toBeInTheDocument()
  })

  it('renders the expand chevron button with aria-label "Ver mais opções"', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByRole('button', { name: /ver mais opções/i, hidden: true })).toBeInTheDocument()
  })

  it('shows the label when collapsed', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    // The collapsed content wrapper should NOT have opacity-0
    const collapsedRow = container.querySelector('[data-testid="collapsed-row"]')
    expect(collapsedRow).not.toHaveClass('opacity-0')
  })

  // ── Expand / collapse ─────────────────────────────────────────────────────

  it('expands when chevron is clicked', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    const chevron = screen.getByRole('button', { name: /ver mais opções/i })
    fireEvent.click(chevron)
    const expandedPanel = container.querySelector('[data-testid="expanded-panel"]')
    expect(expandedPanel).not.toHaveClass('opacity-0')
  })

  it('collapses when close chevron is clicked', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.click(screen.getByRole('button', { name: /fechar opções/i }))
    const expandedPanel = container.querySelector('[data-testid="expanded-panel"]')
    expect(expandedPanel).toHaveClass('opacity-0')
  })

  it('collapses when Escape is pressed', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.keyDown(document, { key: 'Escape' })
    const expandedPanel = container.querySelector('[data-testid="expanded-panel"]')
    expect(expandedPanel).toHaveClass('opacity-0')
  })

  it('collapses when clicking outside the bar', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.mouseDown(document.body)
    const expandedPanel = container.querySelector('[data-testid="expanded-panel"]')
    expect(expandedPanel).toHaveClass('opacity-0')
  })

  // ── Expanded state – options and actions ──────────────────────────────────

  it('shows all three options when expanded', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    expect(screen.getByRole('button', { name: /reservar agora/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /configurar leaf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ser contactado/i })).toBeInTheDocument()
  })

  it('"Reservar agora" in expanded panel dispatches ctabar:reserve and collapses', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))

    const dispatched: Event[] = []
    window.addEventListener('ctabar:reserve', (e) => dispatched.push(e))

    fireEvent.click(screen.getByRole('button', { name: /reservar agora/i }))
    expect(dispatched).toHaveLength(1)
  })

  it('"Configurar Leaf" scrolls to #configurador and collapses', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.click(screen.getByRole('button', { name: /configurar leaf/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('configurador')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    mockGetElementById.mockRestore()
  })

  it('"Ser Contactado" scrolls to #contacto and collapses', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.click(screen.getByRole('button', { name: /ser contactado/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('contacto')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    mockGetElementById.mockRestore()
  })

  it('expanded options have tabIndex -1 when panel is collapsed', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    // Panel is collapsed by default — expanded-only buttons should be unreachable
    const configurarBtn = screen.getByRole('button', { name: /configurar leaf/i, hidden: true })
    expect(configurarBtn).toHaveAttribute('tabindex', '-1')
  })

  // ── "Reservar agora" main CTA (collapsed state) ───────────────────────────

  it('"Reservar agora" main CTA dispatches ctabar:reserve', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())

    const dispatched: Event[] = []
    window.addEventListener('ctabar:reserve', (e) => dispatched.push(e))

    fireEvent.click(screen.getByRole('button', { name: /reservar agora/i }))
    expect(dispatched).toHaveLength(1)
  })
```

- [ ] **Step 2: Run tests and confirm the new ones fail (old ones still pass)**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage 2>&1 | tail -30
```

Expected: new tests FAIL, existing visibility/intersection tests still PASS.

- [ ] **Step 3: Commit the updated test file**

```bash
git add tests/components/ui/BottomCTABar.test.tsx
git commit -m "test: update BottomCTABar tests for expandable CTA behaviour"
```

---

## Task 2: Rewrite BottomCTABar component

**Files:**
- Modify: `src/components/ui/BottomCTABar.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

const HEADER_BOTTOM = 90

export default function BottomCTABar() {
  const [pastHeader, setPastHeader] = useState(false)
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const hidden = !pastHeader || configuradorVisible || closingVisible || drawerOpen

  // Collapse when bar is hidden
  useEffect(() => {
    if (hidden) setIsExpanded(false)
  }, [hidden])

  // Show after scrolling past the header
  useEffect(() => {
    const onScroll = () => setPastHeader(window.scrollY > HEADER_BOTTOM)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for #configurador and #closing
  useEffect(() => {
    const configurador = document.getElementById('configurador')
    const closing = document.getElementById('closing')
    const observers: IntersectionObserver[] = []

    if (configurador) {
      const obs = new IntersectionObserver(([entry]) => {
        setConfiguradorVisible(entry.isIntersecting)
      }, { threshold: 0 })
      obs.observe(configurador)
      observers.push(obs)
    }

    if (closing) {
      const obs = new IntersectionObserver(([entry]) => {
        setClosingVisible(entry.isIntersecting)
      }, { threshold: 0 })
      obs.observe(closing)
      observers.push(obs)
    }

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ReservationDrawer custom events
  useEffect(() => {
    const onOpen = () => setDrawerOpen(true)
    const onClose = () => setDrawerOpen(false)
    window.addEventListener('reservationdrawer:open', onOpen)
    window.addEventListener('reservationdrawer:close', onClose)
    return () => {
      window.removeEventListener('reservationdrawer:open', onOpen)
      window.removeEventListener('reservationdrawer:close', onClose)
    }
  }, [])

  // Collapse on outside click
  useEffect(() => {
    if (!isExpanded) return
    const onMouseDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isExpanded])

  // Collapse on Escape
  useEffect(() => {
    if (!isExpanded) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isExpanded])

  function openReservation() {
    window.dispatchEvent(new CustomEvent('ctabar:reserve'))
  }

  function scrollToConfigurador() {
    document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToContacto() {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      ref={barRef}
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className={`bg-[#3A3A3C]/95 backdrop-blur-md shadow-2xl overflow-hidden transition-[border-radius] duration-300 ease-in-out ${isExpanded ? 'rounded-2xl' : 'rounded-full'}`}>

        {/* ── COLLAPSED ROW ─────────────────────────────────── */}
        <div
          data-testid="collapsed-row"
          className={`flex items-center gap-4 md:gap-24 pl-7 pr-2.5 py-2.5 transition-all duration-200 ${isExpanded ? 'opacity-0 max-h-0 py-0 pointer-events-none overflow-hidden' : 'opacity-100 max-h-16'}`}
        >
          <div className="flex items-baseline gap-3">
            <span className="text-white font-semibold text-base whitespace-nowrap">Nissan Leaf</span>
            <span className="text-white/50 text-sm whitespace-nowrap">Desde 29.900€</span>
          </div>
          <button
            type="button"
            onClick={openReservation}
            tabIndex={hidden || isExpanded ? -1 : undefined}
            aria-label="Reservar agora"
            className="bg-[#E8372F] text-white font-semibold text-base px-6 py-2.5 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer whitespace-nowrap"
          >
            Reservar agora
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            tabIndex={hidden || isExpanded ? -1 : undefined}
            aria-expanded={false}
            aria-label="Ver mais opções"
            className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 10L8 5L13 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* ── EXPANDED PANEL ────────────────────────────────── */}
        <div
          data-testid="expanded-panel"
          className={`transition-all duration-200 delay-100 overflow-hidden ${isExpanded ? 'opacity-100 max-h-56' : 'opacity-0 max-h-0 pointer-events-none'}`}
        >
          <div className="px-7 pt-5 pb-3 flex flex-col gap-1 min-w-[220px]">
            <button
              type="button"
              onClick={() => { openReservation(); setIsExpanded(false) }}
              tabIndex={isExpanded ? undefined : -1}
              aria-label="Reservar agora"
              className="text-white font-semibold text-base py-2 text-left hover:text-white/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              Reservar agora
            </button>
            <button
              type="button"
              onClick={() => { scrollToConfigurador(); setIsExpanded(false) }}
              tabIndex={isExpanded ? undefined : -1}
              aria-label="Configurar Leaf"
              className="text-white font-semibold text-base py-2 text-left hover:text-white/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              Configurar Leaf
            </button>
            <button
              type="button"
              onClick={() => { scrollToContacto(); setIsExpanded(false) }}
              tabIndex={isExpanded ? undefined : -1}
              aria-label="Ser Contactado"
              className="text-white font-semibold text-base py-2 text-left hover:text-white/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              Ser Contactado
            </button>
          </div>
          <div className="flex justify-end pr-2.5 pb-2.5">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              tabIndex={isExpanded ? undefined : -1}
              aria-expanded={true}
              aria-label="Fechar opções"
              className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage 2>&1 | tail -30
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx
git commit -m "feat: expandable CTA bar with Reservar agora as primary action"
```

---

## Task 3: Wire Configurador to open drawer on ctabar:reserve

**Files:**
- Modify: `src/components/sections/Configurador.tsx`

- [ ] **Step 1: Add event listener useEffect**

In `Configurador.tsx`, add this `useEffect` after the existing `useEffect` that dispatches `reservationdrawer:open` (after line 89):

```tsx
  // Open drawer when BottomCTABar fires ctabar:reserve
  useEffect(() => {
    const onReserve = () => setIsDrawerOpen(true)
    window.addEventListener('ctabar:reserve', onReserve)
    return () => window.removeEventListener('ctabar:reserve', onReserve)
  }, [])
```

- [ ] **Step 2: Run the full test suite to confirm no regressions**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npx jest --no-coverage 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Configurador.tsx
git commit -m "feat: open reservation drawer from CTA bar via ctabar:reserve event"
```

---

## Task 4: Manual smoke test

- [ ] **Step 1: Run dev server**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npm run dev
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000`. Scroll past the header. Confirm:

1. Bar appears with "Reservar agora" CTA and a ↑ chevron
2. Clicking "Reservar agora" opens the reservation drawer
3. Clicking ↑ expands the panel with all three options; label disappears; border radius transitions
4. "Reservar agora" in the panel opens the drawer and collapses
5. "Configurar Leaf" scrolls to the configurador section and collapses
6. "Ser Contactado" scrolls to the contact section and collapses
7. Clicking ↓ collapses the panel
8. Clicking outside the panel collapses it
9. Pressing Escape collapses it
10. Bar hides when configurador or closing section enters viewport
