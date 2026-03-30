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

// The class applied when the bar is hidden (from BottomCTABar.tsx)
const HIDDEN_CLASS = 'translate-y-[calc(100%+2rem)]'

// Helper: simulate scrolling past the header so pastHeader becomes true
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

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the car name copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
  })

  it('renders the price copy', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByText('Desde 29.900€')).toBeInTheDocument()
  })

  it('renders the Configurar button', () => {
    setupAnchors()
    render(<BottomCTABar />)
    expect(screen.getByRole('button', { hidden: true })).toHaveAttribute('aria-label', 'Ir para o configurador')
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

  it('sets tabIndex -1 on button when hidden', () => {
    const { configurador } = setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
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
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ir para o configurador/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('configurador')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    mockGetElementById.mockRestore()
  })
})
