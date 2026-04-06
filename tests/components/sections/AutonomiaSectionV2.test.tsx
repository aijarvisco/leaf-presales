import React from 'react'
import { render, screen } from '@testing-library/react'
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
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, output: unknown[]) => output[0],
    useMotionValueEvent: () => {},
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/ui/Modal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'modal' }, children),
}))

jest.mock('@/components/forms/SavingsCalculator', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'savings-calculator' }),
}))

import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'

describe('AutonomiaSectionV2', () => {
  it('renders the section heading', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Uma bateria que vai onde tu vais.')).toBeInTheDocument()
  })

  it('applies --text-display CSS variable to the heading', () => {
    render(<AutonomiaSectionV2 />)
    const heading = screen.getByText('Uma bateria que vai onde tu vais.')
    expect(heading.style.fontSize).toBe('var(--text-display)')
  })

  it('eyebrow label has text-base class (not text-3xl)', () => {
    render(<AutonomiaSectionV2 />)
    const eyebrow = screen.getByText('Autonomia')
    expect(eyebrow.className).toContain('text-base')
    expect(eyebrow.className).not.toContain('text-3xl')
  })

  it('renders all three stat descriptors', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia em ciclo WLTP')).toBeInTheDocument()
    expect(screen.getByText('De 20 a 80% em carga rápida')).toBeInTheDocument()
  })
})
