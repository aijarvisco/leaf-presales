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
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('@/components/ui/ContactDrawer', () => ({
  __esModule: true,
  default: () => null,
}))

import LeadSection from '@/components/sections/LeadSection'

describe('LeadSection', () => {
  it('renders the section heading', () => {
    render(<LeadSection />)
    expect(screen.getByText('Ainda com dúvidas?')).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the heading', () => {
    render(<LeadSection />)
    const heading = screen.getByText('Ainda com dúvidas?')
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })
})
