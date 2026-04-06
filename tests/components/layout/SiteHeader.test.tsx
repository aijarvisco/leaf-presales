// tests/components/layout/SiteHeader.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', { alt, ...props }),
}))

import SiteHeader from '@/components/layout/SiteHeader'

describe('SiteHeader', () => {
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

  // ── Structure ──────────────────────────────────────────────────────────────

  // SiteHeader uses `absolute` (not fixed) — the header scrolls with the page by design
  it('outer wrapper is z-50', () => {
    render(<SiteHeader />)
    const wrapper = screen.getByRole('banner').parentElement!
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

  // ── Responsive padding ─────────────────────────────────────────────────────

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
})
