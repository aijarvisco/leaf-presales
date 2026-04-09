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
    const btn = screen.getByRole('button', { name: /reservar agora/i, hidden: true })
    expect(btn).toHaveAttribute('tabindex', '-1')
  })

  // ── Responsive layout ────────────────────────────────────────────────────

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
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    const panel = container.querySelector('[data-testid="expanded-panel"]')!
    expect(within(panel).getByRole('button', { name: /reservar agora/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /configurar leaf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ser contactado/i })).toBeInTheDocument()
  })

  it('"Reservar agora" in expanded panel dispatches ctabar:reserve and collapses', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))

    const dispatched: Event[] = []
    window.addEventListener('ctabar:reserve', (e) => dispatched.push(e), { once: true })

    const panel = container.querySelector('[data-testid="expanded-panel"]')!
    fireEvent.click(within(panel).getByRole('button', { name: /reservar agora/i }))
    expect(dispatched).toHaveLength(1)
    expect(container.querySelector('[data-testid="expanded-panel"]')).toHaveClass('opacity-0')
  })

  it('"Configurar Leaf" scrolls to #configurador and collapses', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.click(screen.getByRole('button', { name: /configurar leaf/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('configurador')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(container.querySelector('[data-testid="expanded-panel"]')).toHaveClass('opacity-0')
    mockGetElementById.mockRestore()
  })

  it('"Ser Contactado" scrolls to #contacto and collapses', () => {
    setupAnchors()
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement)

    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /ver mais opções/i }))
    fireEvent.click(screen.getByRole('button', { name: /ser contactado/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('contacto')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(container.querySelector('[data-testid="expanded-panel"]')).toHaveClass('opacity-0')
    mockGetElementById.mockRestore()
  })

  it('expanded options have tabIndex -1 when panel is collapsed', () => {
    setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    const configurarBtn = screen.getByRole('button', { name: /configurar leaf/i, hidden: true })
    expect(configurarBtn).toHaveAttribute('tabindex', '-1')
  })

  // ── "Reservar agora" main CTA (collapsed state) ───────────────────────────

  it('"Reservar agora" main CTA dispatches ctabar:reserve', () => {
    setupAnchors()
    const { container } = render(<BottomCTABar />)
    act(() => scrollPastHeader())

    const dispatched: Event[] = []
    window.addEventListener('ctabar:reserve', (e) => dispatched.push(e), { once: true })

    const collapsedRow = container.querySelector('[data-testid="collapsed-row"]')!
    fireEvent.click(within(collapsedRow).getByRole('button', { name: /reservar agora/i }))
    expect(dispatched).toHaveLength(1)
  })
})
