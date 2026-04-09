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
    expect(screen.getByText('Excelência elétrica para chegar mais longe')).toBeInTheDocument()
  })

  it('applies --text-display CSS variable to the heading', () => {
    render(<AutonomiaSectionV2 />)
    const heading = screen.getByText('Excelência elétrica para chegar mais longe')
    expect(heading.style.fontSize).toBe('var(--text-display)')
  })

  it('eyebrow label has text-base class', () => {
    render(<AutonomiaSectionV2 />)
    const eyebrow = screen.getByText('Autonomia')
    expect(eyebrow.className).toContain('text-base')
  })

  it('renders all three stat descriptors', () => {
    render(<AutonomiaSectionV2 />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia.')).toBeInTheDocument()
    expect(screen.getByText('de garantia na bateria')).toBeInTheDocument()
  })

  it('stat numbers use responsive Tailwind classes, not hardcoded inline fontSize', () => {
    render(<AutonomiaSectionV2 />)
    // Find the span with stat number "75"
    const numberSpan = screen.getByText('75')
    expect(numberSpan.style.fontSize).toBe('')
    expect(numberSpan.className).toContain('text-4xl')
  })

  it('stats container uses px-4 class for mobile padding', () => {
    const { container } = render(<AutonomiaSectionV2 />)
    // The stats panel div should have px-4
    const statsPanel = container.querySelector('.px-4')
    expect(statsPanel).toBeInTheDocument()
  })
})
