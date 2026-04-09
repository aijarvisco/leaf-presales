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
    // Default title uses dangerouslySetInnerHTML — text is split at <br/>
    expect(screen.getByText(/Conforto e tecnologia/)).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<ValuesSection />)
    const heading = screen.getByRole('heading', { level: 2 })
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

  it('paragraph below title has text-base class for mobile', () => {
    const { container } = render(<ValuesSection paragraphHtml="Test paragraph" />)
    const para = container.querySelector('p.text-base')
    expect(para).toBeInTheDocument()
  })

  it('paragraph below title does not use text-xl without breakpoint', () => {
    const { container } = render(<ValuesSection paragraphHtml="Test paragraph" />)
    // Should have md:text-xl (responsive), not bare text-xl
    const para = container.querySelector('p.text-xl')
    expect(para).toBeNull()
  })
})
