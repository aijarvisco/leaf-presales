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
    useMotionValue: () => ({ get: () => 0, set: () => {}, getVelocity: () => 0 }),
    animate: jest.fn(),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import ValuesSection from '@/components/sections/ValuesSection'

describe('ValuesSection', () => {
  it('renders the section heading', () => {
    render(<ValuesSection />)
    expect(screen.getByText('Designed to make a difference.')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<ValuesSection />)
    const heading = screen.getByText('Designed to make a difference.')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('renders 4 value cards', () => {
    render(<ValuesSection />)
    expect(screen.getByText('8 anos de garantia na bateria.')).toBeInTheDocument()
    expect(screen.getByText('Do quotidiano à escapadela.')).toBeInTheDocument()
    expect(screen.getByText('Carrega sem complicações.')).toBeInTheDocument()
    expect(screen.getByText('Sempre ligado, onde estiveres.')).toBeInTheDocument()
  })

  it('renders pagination controls', () => {
    const { container } = render(<ValuesSection />)
    const prevButton = container.querySelector('button[aria-label="Anterior"]')
    const nextButton = container.querySelector('button[aria-label="Próximo"]')
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })
})
