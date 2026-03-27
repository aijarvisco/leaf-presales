# Bottom CTA Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a globally persistent fixed bottom bar showing "Nissan Leaf / Entregas previstas em Maio" with a red "Configurar" CTA that scrolls to `#configurador`, hiding automatically when the configurador or closing sections are in view or when the reservation drawer is open.

**Architecture:** A new `BottomCTABar` client component manages its own visibility via two `IntersectionObserver` instances and a window custom-event listener. `Configurador` dispatches `reservationdrawer:open/close` events on drawer state changes. The bar is mounted as a sibling of `<main>` in `page.tsx`.

**Tech Stack:** React (hooks), Tailwind CSS, IntersectionObserver API, window CustomEvent

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/ui/BottomCTABar.tsx` | Create | Bar UI + all visibility logic |
| `tests/components/ui/BottomCTABar.test.tsx` | Create | Full test coverage for the bar |
| `src/components/sections/Configurador.tsx` | Modify | Dispatch drawer custom events |
| `tests/Configurador.test.tsx` | Modify | Add drawer event dispatch tests |
| `src/components/sections/ClosingSection.tsx` | Modify | Add `id="closing"` to root section |
| `src/app/page.tsx` | Modify | Mount `<BottomCTABar />` outside `<main>` |

---

## Task 1: Create `BottomCTABar` component (failing tests first)

**Files:**
- Create: `tests/components/ui/BottomCTABar.test.tsx`
- Create: `src/components/ui/BottomCTABar.tsx`

### IntersectionObserver mock pattern

All tests in this task use a controllable mock that lets you trigger `isIntersecting` callbacks manually:

```ts
type ObserverCallback = (entries: IntersectionObserverEntry[]) => void
const observers: Map<Element, ObserverCallback> = new Map()

global.IntersectionObserver = class {
  constructor(private cb: ObserverCallback) {}
  observe(el: Element) { observers.set(el, this.cb) }
  unobserve(el: Element) { observers.delete(el) }
  disconnect() { observers.clear() }
} as unknown as typeof IntersectionObserver

function triggerIntersection(el: Element, isIntersecting: boolean) {
  observers.get(el)?.([{ isIntersecting, target: el } as IntersectionObserverEntry])
}
```

- [ ] **Step 1: Write the test file**

Create `tests/components/ui/BottomCTABar.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

// ── DOM anchors the observers target ──────────────────────────────────────
function setupAnchors() {
  const configurador = document.createElement('section')
  configurador.id = 'configurador'
  const closing = document.createElement('section')
  closing.id = 'closing'
  document.body.appendChild(configurador)
  document.body.appendChild(closing)
  return { configurador, closing }
}

import BottomCTABar from '@/components/ui/BottomCTABar'

describe('BottomCTABar', () => {
  beforeEach(() => {
    observers.clear()
    document.body.innerHTML = ''
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the car name copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
  })

  it('renders the delivery copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('/ Entregas previstas em Maio')).toBeInTheDocument()
  })

  it('renders the Configurar button', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByRole('button', { name: /ir para o configurador/i })).toBeInTheDocument()
  })

  // ── Initial visibility ────────────────────────────────────────────────────

  it('is visible on initial render', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain('translate-y-full')
  })

  // ── Configurador section suppression ─────────────────────────────────────

  it('hides when configurador section enters viewport', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => triggerIntersection(configurador, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain('translate-y-full')
  })

  it('shows again when configurador section leaves viewport', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => triggerIntersection(configurador, true))
    act(() => triggerIntersection(configurador, false))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain('translate-y-full')
  })

  // ── Closing section suppression ───────────────────────────────────────────

  it('hides when closing section enters viewport', () => {
    const { closing } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => triggerIntersection(closing, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain('translate-y-full')
  })

  it('shows again when closing section leaves viewport', () => {
    const { closing } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => triggerIntersection(closing, true))
    act(() => triggerIntersection(closing, false))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain('translate-y-full')
  })

  // ── Drawer suppression ────────────────────────────────────────────────────

  it('hides when reservationdrawer:open event fires', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:open')))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain('translate-y-full')
  })

  it('shows when reservationdrawer:close event fires after open', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:open')))
    act(() => window.dispatchEvent(new CustomEvent('reservationdrawer:close')))
    const bar = container.firstChild as HTMLElement
    expect(bar.className).not.toContain('translate-y-full')
  })

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('sets aria-hidden when hidden', () => {
    const { configurador } = setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => triggerIntersection(configurador, true))
    const bar = container.firstChild as HTMLElement
    expect(bar.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not set aria-hidden when visible', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    const bar = container.firstChild as HTMLElement
    expect(bar.getAttribute('aria-hidden')).toBeNull()
  })

  it('sets tabIndex -1 on button when hidden', () => {
    const { configurador } = setupAnchors()
    render(<BottomCTABar />)
    act(() => triggerIntersection(configurador, true))
    const btn = screen.getByRole('button', { hidden: true })
    expect(btn).toHaveAttribute('tabindex', '-1')
  })

  // ── CTA interaction ───────────────────────────────────────────────────────

  it('scrolls to #configurador when button is clicked', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    render(<BottomCTABar />)
    fireEvent.click(screen.getByRole('button', { name: /ir para o configurador/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('configurador')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    mockGetElementById.mockRestore()
  })
})
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage
```

Expected: all tests fail with "Cannot find module '@/components/ui/BottomCTABar'"

- [ ] **Step 3: Create the component**

Create `src/components/ui/BottomCTABar.tsx`:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

export default function BottomCTABar() {
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hidden = configuradorVisible || closingVisible || drawerOpen

  // IntersectionObserver for #configurador and #closing
  useEffect(() => {
    const configurador = document.getElementById('configurador')
    const closing = document.getElementById('closing')

    const observers: IntersectionObserver[] = []

    if (configurador) {
      const obs = new IntersectionObserver(([entry]) => {
        setConfiguradorVisible(entry.isIntersecting)
      })
      obs.observe(configurador)
      observers.push(obs)
    }

    if (closing) {
      const obs = new IntersectionObserver(([entry]) => {
        setClosingVisible(entry.isIntersecting)
      })
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

  function scrollToConfigurador() {
    document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 bg-[#1C1C1E] border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-full' : ''}`}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className="h-14 flex items-center justify-between px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Nissan Leaf</span>
          <span className="text-white/50 text-sm">/ Entregas previstas em Maio</span>
        </div>
        <button
          onClick={scrollToConfigurador}
          tabIndex={hidden ? -1 : undefined}
          aria-label="Ir para o configurador"
          className="bg-[#E8372F] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer"
        >
          Configurar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx tests/components/ui/BottomCTABar.test.tsx
git commit -m "feat: add BottomCTABar component with visibility logic"
```

---

## Task 2: Add drawer event dispatch to `Configurador`

**Files:**
- Modify: `src/components/sections/Configurador.tsx`
- Modify: `tests/Configurador.test.tsx`

- [ ] **Step 1: Write failing tests for event dispatch**

First, open `tests/Configurador.test.tsx` and add `act` to the existing import line at the top:

```ts
// Before:
import { render, screen, fireEvent } from '@testing-library/react'
// After:
import { render, screen, fireEvent, act } from '@testing-library/react'
```

Then add the following describe block **after** the existing `describe('Configurador', ...)` block (or as a nested describe inside it — either works):

```tsx
describe('Configurador — drawer events', () => {
  // Capture events dispatched to window
  let receivedEvents: string[] = []

  beforeEach(() => {
    receivedEvents = []
    const handler = (e: Event) => receivedEvents.push(e.type)
    window.addEventListener('reservationdrawer:open', handler)
    window.addEventListener('reservationdrawer:close', handler)
    // Store for cleanup
    ;(window as Window & { __testHandler?: EventListener }).__testHandler = handler
  })

  afterEach(() => {
    const h = (window as Window & { __testHandler?: EventListener }).__testHandler
    if (h) {
      window.removeEventListener('reservationdrawer:open', h)
      window.removeEventListener('reservationdrawer:close', h)
    }
  })

  it('does not dispatch any event on initial mount', () => {
    render(<Configurador />)
    expect(receivedEvents).toHaveLength(0)
  })

  it('dispatches reservationdrawer:open when the reserve button is clicked', async () => {
    render(<Configurador />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /reservar agora/i }))
    })
    expect(receivedEvents).toContain('reservationdrawer:open')
  })

  it('dispatches reservationdrawer:close when the drawer is closed', async () => {
    render(<Configurador />)
    // Open
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /reservar agora/i }))
    })
    // Close via the drawer's Fechar button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    })
    expect(receivedEvents).toContain('reservationdrawer:close')
  })
})
```

- [ ] **Step 2: Run new tests — verify they fail**

```bash
npx jest tests/Configurador.test.tsx --no-coverage -t "drawer events"
```

Expected: "does not dispatch" passes (no events are dispatched today); the open/close tests fail because events are never dispatched.

- [ ] **Step 3: Add mount-guarded `useEffect` to `Configurador.tsx`**

In `src/components/sections/Configurador.tsx`, add a new `useRef` and `useEffect` **after** the existing refs (around line 19) and **after** the existing `useEffect` (around line 76). Do not modify the scroll-pin effect.

Add near the other refs:
```ts
const drawerEventMounted = useRef(false)
```

Add after the scroll-pin `useEffect`:
```ts
useEffect(() => {
  if (!drawerEventMounted.current) {
    drawerEventMounted.current = true
    return
  }
  window.dispatchEvent(new CustomEvent(
    isDrawerOpen ? 'reservationdrawer:open' : 'reservationdrawer:close'
  ))
}, [isDrawerOpen])
```

- [ ] **Step 4: Run all Configurador tests — verify all pass**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: all tests PASS (both existing and new)

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Configurador.tsx tests/Configurador.test.tsx
git commit -m "feat: dispatch reservation drawer open/close events from Configurador"
```

---

## Task 3: Add `id="closing"` to `ClosingSection`

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx`

There is no existing test file for `ClosingSection`. A minimal test is worth adding to prevent regressions.

- [ ] **Step 1: Write a failing test**

Create `tests/components/sections/ClosingSection.test.tsx`:

```tsx
import React from 'react'
import { render } from '@testing-library/react'
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
    useScroll: () => ({ scrollYProgress: { on: () => () => {}, get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, output: unknown[]) => output[0],
    useMotionValueEvent: () => {},
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}))

import ClosingSection from '@/components/sections/ClosingSection'

describe('ClosingSection', () => {
  it('has id="closing" on the root 300vh section', () => {
    const { container } = render(<ClosingSection />)
    expect(container.querySelector('#closing')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx jest tests/components/sections/ClosingSection.test.tsx --no-coverage
```

Expected: FAIL — `#closing` not found

- [ ] **Step 3: Add `id="closing"` in `ClosingSection.tsx`**

In `src/components/sections/ClosingSection.tsx` at line 29, change:

```tsx
      <section ref={containerRef} style={{ height: '300vh' }}>
```

to:

```tsx
      <section id="closing" ref={containerRef} style={{ height: '300vh' }}>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx jest tests/components/sections/ClosingSection.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ClosingSection.tsx tests/components/sections/ClosingSection.test.tsx
git commit -m "feat: add id=closing to ClosingSection root for BottomCTABar observer"
```

---

## Task 4: Mount `BottomCTABar` in `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update `page.tsx`**

Open `src/app/page.tsx`. It currently returns:

```tsx
export default function Home() {
  return (
    <main>
      <SiteHeader />
      ...
      <ClosingSection />
    </main>
  )
}
```

Change it to:

```tsx
import BottomCTABar from '@/components/ui/BottomCTABar'

export default function Home() {
  return (
    <>
      <main>
        <SiteHeader />
        <Hero />
        <Highlights />
        <DesignIntroSection />
        <ValuesSection />
        <AutonomiaSectionV2 />
        <ValuesSection />
        <Configurador />
        <ClosingSection />
      </main>
      <BottomCTABar />
    </>
  )
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS. If any unrelated tests fail, investigate before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: mount BottomCTABar in page layout"
```

---

## Task 5: Manual smoke test

- [ ] Start the dev server

```bash
npm run dev
```

- [ ] Open http://localhost:3000 and verify:
  1. Bar is visible at the bottom on initial load (over the Hero)
  2. Scrolling to `#configurador` hides the bar
  3. Scrolling away from `#configurador` shows the bar again
  4. Scrolling to the `ClosingSection` hides the bar
  5. Scrolling back up shows the bar again
  6. Clicking "Reservar agora" inside the configurator hides the bar (drawer open)
  7. Closing the reservation drawer shows the bar again
  8. Clicking "Configurar" scrolls to `#configurador`
  9. On iOS (or device emulation), bar clears the home indicator
  10. With `prefers-reduced-motion` enabled (OS-level or DevTools), the bar appears/disappears without transition
