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

import Highlights from '@/components/sections/Highlights'

describe('Highlights', () => {
  it('renders the section heading', () => {
    render(<Highlights />)
    expect(screen.getByText('Desenhado para surpreender.')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<Highlights />)
    const heading = screen.getByText('Desenhado para surpreender.')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('renders 4 highlight images', () => {
    render(<Highlights />)
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4)
  })

  it('renders pagination controls', () => {
    render(<Highlights />)
    expect(screen.getByRole('button', { name: /Anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Próximo/i })).toBeInTheDocument()
  })
})
