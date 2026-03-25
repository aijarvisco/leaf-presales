import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Framer Motion uses browser APIs not available in jsdom.
// Mock motion.* so tests focus on markup, not animation.
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
    useTransform: () => 0,
  }
})

// next/image renders a plain <img> in tests
jest.mock('next/image', () =>
  React.forwardRef(({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>, ref) =>
    React.createElement('img', { src, alt, ...props, ref })
  )
)

import DesignIntroSection from '@/components/sections/DesignIntroSection'

describe('DesignIntroSection', () => {
  it('renders the section with the correct id', () => {
    render(<DesignIntroSection />)
    expect(document.getElementById('design-intro')).toBeInTheDocument()
  })

  it('renders the Design label', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Uma forma que fala por si.')).toBeInTheDocument()
  })

  it('renders the car image with correct alt text', () => {
    render(<DesignIntroSection />)
    const img = screen.getByAltText('Nissan Leaf — vista de cima')
    expect(img).toBeInTheDocument()
  })
})
