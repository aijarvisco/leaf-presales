// tests/components/layout/SiteHeader.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Track whether reduced motion is active — mutate this in individual tests
let mockPrefersReducedMotion = false

// Spy on useScroll so we can assert it is called window-level (no target)
// eslint-disable-next-line no-var
var mockUseScroll: jest.Mock

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  // Initialize inside the factory so it is available when Jest hoists this call
  mockUseScroll = jest.fn(() => ({ scrollY: { get: () => 0 } }))
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
    expect(header.style.background).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.85\)/)
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
