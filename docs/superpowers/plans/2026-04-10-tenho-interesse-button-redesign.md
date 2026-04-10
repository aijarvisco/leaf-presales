# Tenho Interesse Button Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace "Reservar agora" CTAs with "Tenho Interesse", redesign the floating `BottomCTABar` into a single pill button with an upward-opening dropdown (ChevronDown/ArrowRight icons from lucide-react), and do a copy-only update for the Configurador CTA.

**Architecture:** `BottomCTABar` is restructured: the separate CTA pill + expand-chevron pair becomes a single "Tenho Interesse" pill. DOM order flips so the menu panel sits above the always-visible main row. The `Configurador` component gets text changes only. All behaviour (scroll detection, intersection, drawer events, keyboard, outside-click) is preserved.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Jest + Testing Library, lucide-react (new)

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/components/ui/BottomCTABar.tsx` — full restructure |
| Modify | `src/components/sections/Configurador.tsx` — copy change only |
| Modify | `tests/components/ui/BottomCTABar.test.tsx` — rewrite for new API |
| Modify | `tests/Configurador.test.tsx` — update button name references |

---

## Task 1: Install lucide-react

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
npm install lucide-react
```

Expected: `lucide-react` appears in `package.json` dependencies.

- [ ] **Step 2: Verify it can be imported**

```bash
node -e "require('lucide-react')" && echo "OK"
```

Expected output: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react for icon support"
```

---

## Task 2: Rewrite BottomCTABar tests

The existing test file targets the old two-button layout. Replace it entirely with tests for the new design. Run them first to confirm they all fail before the implementation changes.

**Files:**
- Modify: `tests/components/ui/BottomCTABar.test.tsx`

- [ ] **Step 1: Replace the test file**

Replace the entire contents of `tests/components/ui/BottomCTABar.test.tsx` with:

```tsx
import React from 'react'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── IntersectionObserver mock ──────────────────────────────────────────────
type IOCallback = (entries: IntersectionObserverEntry[]) => void
const observers = new Map<Element, IOCallback>()

global.IntersectionObserver = class {
  constructor(private cb: IOCallback) {}
  observe(el: Element) { observers.set(el, this.cb) }
  unobserve(el: Element) { observers.delete(el) }
  disconnect() { observers.clear() }
} as unknown as typeof IntersectionObserver

function triggerIntersection(el: Element, isIntersecting: boolean) {
  observers.get(el)?.([{ isIntersecting, target: el } as IntersectionObserverEntry])
}

function setupAnchors() {
  const configurador = document.createElement('section')
  configurador.id = 'configurador'
  const closing = document.createElement('section')
  closing.id = 'closing'
  document.body.appendChild(configurador)
  document.body.appendChild(closing)
  return { configurador, closing }
}

const HIDDEN_CLASS = 'translate-y-[calc(100%+2rem)]'

function scrollPastHeader() {
  Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true })
  fireEvent.scroll(window)
}

import BottomCTABar from '@/components/ui/BottomCTABar'

describe('BottomCTABar', () => {
  beforeEach(() => {
    observers.clear()
    document.body.innerHTML = ''
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  // ── Static content ────────────────────────────────────────────────────────

  it('renders the car name copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
  })

  it('renders the price copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('Desde 39.900€')).toBeInTheDocument()
  })

  it('renders the "Tenho Interesse" toggle button', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByRole('button', { name: /tenho interesse/i, hidden: true })).toBeInTheDocument()
  })

  // ── Initial visibility ────────────────────────────────────────────────────

  it('is hidden on initial render (before scroll)', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain(HIDDEN_CLASS)
  })

  it('becomes visible after scrolling past the header', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain(HIDDEN_CLASS)
  })

  // ── Configurador section suppression ─────────────────────────────────────

  it('hides when configurador section enters viewport', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(configurador, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain(HIDDEN_CLASS)
  })

  it('shows again when configurador section leaves viewport', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(configurador, true))
    act(() => triggerIntersection(configurador, false))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain(HIDDEN_CLASS)
  })

  // ── Closing section suppression ───────────────────────────────────────────

  it('hides when closing section enters viewport', () => {
    const { closing } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(closing, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain(HIDDEN_CLASS)
  })

  it('shows again when closing section leaves viewport', () => {
    const { closing } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(closing, true))
    act(() => triggerIntersection(closing, false))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain(HIDDEN_CLASS)
  })

  // ── Drawer suppression ────────────────────────────────────────────────────

  it('hides when reservationdrawer:open event fires', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:open')))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain(HIDDEN_CLASS)
  })

  it('shows when reservationdrawer:close event fires after open', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:open')))
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:close')))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain(HIDDEN_CLASS)
  })

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('sets aria-hidden when hidden', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(configurador, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not set aria-hidden when visible', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    const bar = container.firstChild as HTMLElement
    expect(bar.getAttribute('aria-hidden')).toBeNull()
  })

  it('sets tabIndex -1 on toggle button when hidden', () => {
    const { configurador } = setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    act(() => triggerIntersection(configurador, true))
    const btn = screen.getByRole('button', { name: /tenho interesse/i, hidden: true })
    expect(btn).toHaveAttribute('tabindex', '-1')
  })

  // ── Layout ────────────────────────────────────────────────────────────────

  it('outer wrapper uses safe-area-inset-bottom for bottom positioning', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.style.bottom).toContain('safe-area-inset-bottom')
  })

  it('outer wrapper has max-w-[calc(100vw-2rem)] to prevent viewport overflow', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain('max-w-[calc(100vw-2rem)]')
  })

  // ── Toggle behaviour ──────────────────────────────────────────────────────

  it('"Tenho Interesse" button has aria-expanded=false by default', () => {
    setupAnchors()
    render(<BottomCTABar />)
    const btn = screen.getByRole('button', { name: /tenho interesse/i, hidden: true })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking "Tenho Interesse" sets aria-expanded=true', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('menu panel becomes visible when toggle is clicked', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    const panel = container.querySelector('[data-testid="menu-panel"]')!
    expect(panel).not.toHaveClass('opacity-0')
  })

  it('menu panel is hidden when collapsed', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    const panel = container.querySelector('[data-testid="menu-panel"]')!
    // inner content div should carry opacity-0
    expect(panel.querySelector('.opacity-0')).toBeInTheDocument()
  })

  it('menu shows "Quero ser contactado" item when expanded', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    const panel = container.querySelector('[data-testid="menu-panel"]')!
    expect(within(panel).getByRole('button', { name: /quero ser contactado/i })).toBeInTheDocument()
  })

  it('menu shows "Quero reservar" item when expanded', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    const panel = container.querySelector('[data-testid="menu-panel"]')!
    expect(within(panel).getByRole('button', { name: /quero reservar/i })).toBeInTheDocument()
  })

  it('menu items have tabIndex -1 when panel is collapsed', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    expect(screen.getByRole('button', { name: /quero ser contactado/i, hidden: true })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('button', { name: /quero reservar/i, hidden: true })).toHaveAttribute('tabindex', '-1')
  })

  it('clicking "Tenho Interesse" again collapses the menu', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('collapses when Escape is pressed', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('collapses when clicking outside the bar', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    fireEvent.mouseDown(document.body)
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Menu item actions ─────────────────────────────────────────────────────

  it('"Quero reservar" dispatches ctabar:reserve and collapses menu', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))

    const dispatched: Event[] = []
    window.addEventListener('ctabar:reserve', (e) => dispatched.push(e), { once: true })

    const panel = container.querySelector('[data-testid="menu-panel"]')!
    fireEvent.click(within(panel).getByRole('button', { name: /quero reservar/i }))
    expect(dispatched).toHaveLength(1)
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('"Quero ser contactado" scrolls to #contacto and collapses menu', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))

    const panel = container.querySelector('[data-testid="menu-panel"]')!
    fireEvent.click(within(panel).getByRole('button', { name: /quero ser contactado/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('contacto')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'false')
    mockGetElementById.mockRestore()
  })
})
```

- [ ] **Step 2: Run the tests — expect failures**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npm test -- tests/components/ui/BottomCTABar.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: Multiple test failures referencing "Tenho Interesse", "menu-panel", etc.

- [ ] **Step 3: Commit the test file**

```bash
git add tests/components/ui/BottomCTABar.test.tsx
git commit -m "test(BottomCTABar): rewrite tests for Tenho Interesse dropdown redesign"
```

---

## Task 3: Implement new BottomCTABar

Replace the component implementation to match the new design.

**Files:**
- Modify: `src/components/ui/BottomCTABar.tsx`

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/ui/BottomCTABar.tsx` with:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'

const HEADER_BOTTOM = 90

export default function BottomCTABar() {
  const [pastHeader, setPastHeader] = useState(false)
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const hidden = !pastHeader || configuradorVisible || closingVisible || drawerOpen

  useEffect(() => {
    if (hidden) setIsExpanded(false)
  }, [hidden])

  useEffect(() => {
    const onScroll = () => setPastHeader(window.scrollY > HEADER_BOTTOM)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    setIsExpanded(false)
  }

  function scrollToContacto() {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
    setIsExpanded(false)
  }

  return (
    <div
      ref={barRef}
      className={`fixed left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 md:max-w-[calc(100vw-2rem)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className={`bg-[#3A3A3C]/95 backdrop-blur-md shadow-2xl overflow-hidden transition-[border-radius] duration-300 ease-out ${isExpanded ? 'rounded-2xl' : 'rounded-full'}`}>

        {/* ── MENU PANEL (renders above main row) ───────────────────── */}
        <div
          data-testid="menu-panel"
          aria-hidden={isExpanded ? undefined : 'true'}
          style={{ display: 'grid', gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
          className="transition-[grid-template-rows] duration-300 ease-out"
        >
          <div className="overflow-hidden">
            <div className={`px-2 pt-3 pb-3 flex flex-col min-w-[240px] transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <button
                type="button"
                onClick={scrollToContacto}
                tabIndex={isExpanded ? undefined : -1}
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
              >
                <span>Quero ser contactado</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={openReservation}
                tabIndex={isExpanded ? undefined : -1}
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
              >
                <span>Quero reservar</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN ROW (always visible) ──────────────────────────────── */}
        <div
          data-testid="main-row"
          className="flex items-center justify-between pl-7 pr-2.5 py-2.5"
        >
          <div className="hidden md:flex items-baseline gap-3">
            <span className="text-white font-semibold text-base whitespace-nowrap">Nissan Leaf</span>
            <span className="text-white/50 text-sm whitespace-nowrap">Desde 39.900€</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            tabIndex={hidden ? -1 : undefined}
            aria-expanded={isExpanded}
            aria-label="Tenho Interesse"
            className="bg-white text-[#0A0A0A] font-semibold text-base px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto"
          >
            Tenho Interesse
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              aria-hidden="true"
            />
          </button>
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the tests — expect pass**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npm test -- tests/components/ui/BottomCTABar.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: All tests pass. If any fail, read the error carefully — the most common issue would be a selector mismatch (e.g. `aria-label` vs text content).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx
git commit -m "feat(BottomCTABar): redesign as single Tenho Interesse dropdown with lucide icons"
```

---

## Task 4: Update Configurador tests

Update the test file to expect "Tenho Interesse" instead of "Reservar agora".

**Files:**
- Modify: `tests/Configurador.test.tsx`

- [ ] **Step 1: Update the four references to "Reservar agora"**

In `tests/Configurador.test.tsx`, make these four targeted edits:

**Edit 1** — test description and selector (line ~79):
```tsx
// Before:
  it('renders the Reservar agora CTA button', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /reservar agora/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

// After:
  it('renders the Tenho Interesse CTA button', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    expect(buttons.length).toBeGreaterThan(0)
  })
```

**Edit 2** — test description and selectors (line ~104):
```tsx
// Before:
  it('clicking Reservar agora opens the reservation drawer', () => {
    render(<Configurador />)
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: /reservar agora/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
  })

// After:
  it('clicking Tenho Interesse opens the reservation drawer', () => {
    render(<Configurador />)
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
  })
```

**Edit 3** — closing drawer test (line ~112):
```tsx
// Before:
  it('closing the drawer hides it', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /reservar agora/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Fechar'))
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  })

// After:
  it('closing the drawer hides it', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Fechar'))
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  })
```

**Edit 4** — dispatch tests (lines ~148, ~155):
```tsx
// Before:
      fireEvent.click(screen.getAllByRole('button', { name: /reservar agora/i })[0])
// After (both occurrences):
      fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
```

- [ ] **Step 2: Run the tests — expect failures**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npm test -- tests/Configurador.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: Failures on tests that look for "Tenho Interesse" (the button still says "Reservar agora").

- [ ] **Step 3: Commit the test file**

```bash
git add tests/Configurador.test.tsx
git commit -m "test(Configurador): update CTA button name to Tenho Interesse"
```

---

## Task 5: Update Configurador copy

**Files:**
- Modify: `src/components/sections/Configurador.tsx:141,155`

- [ ] **Step 1: Change desktop button text (line 141)**

In `src/components/sections/Configurador.tsx`, find the desktop button:

```tsx
// Before (inside hidden md:flex section):
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>

// After:
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Tenho Interesse
              </button>
```

- [ ] **Step 2: Change mobile button text (line 155)**

In `src/components/sections/Configurador.tsx`, find the mobile button:

```tsx
// Before (inside flex md:hidden section):
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>

// After:
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Tenho Interesse
              </button>
```

- [ ] **Step 3: Run the Configurador tests — expect pass**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npm test -- tests/Configurador.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Configurador.tsx
git commit -m "feat(Configurador): rename CTA copy from Reservar agora to Tenho Interesse"
```

---

## Task 6: Final test run

- [ ] **Step 1: Run the full test suite**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npm test --no-coverage 2>&1 | tail -30
```

Expected: All tests pass. If any unrelated test references "Reservar agora" and fails, check `tests/StickyBar.test.tsx` — the `StickyBar` component is out of scope and unchanged, so its tests should still pass as-is.
