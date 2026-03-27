// tests/components/layout/SiteHeader.test.tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import SiteHeader from '@/components/layout/SiteHeader'

describe('SiteHeader', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
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
