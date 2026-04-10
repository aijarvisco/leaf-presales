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
    expect(panel).toHaveAttribute('aria-hidden', 'true')
  })

  it('collapses menu when bar becomes hidden', () => {
    const { configurador } = setupAnchors()
    render(<BottomCTABar />)
    act(() => scrollPastHeader())
    fireEvent.click(screen.getByRole('button', { name: /tenho interesse/i }))
    expect(screen.getByRole('button', { name: /tenho interesse/i })).toHaveAttribute('aria-expanded', 'true')
    act(() => triggerIntersection(configurador, true))
    expect(screen.getByRole('button', { name: /tenho interesse/i, hidden: true })).toHaveAttribute('aria-expanded', 'false')
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
