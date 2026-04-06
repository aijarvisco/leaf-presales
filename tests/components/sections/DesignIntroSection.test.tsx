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
          // eslint-disable-next-line react/display-name
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useReducedMotion: () => false,
  }
})

// next/image renders a plain <img> in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, fill, priority, sizes, quality, placeholder, blurDataURL, onLoad, onError, ...props }: { alt: string; fill?: boolean; priority?: boolean; sizes?: string; quality?: number; placeholder?: string; blurDataURL?: string; onLoad?: () => void; onError?: () => void; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import DesignIntroSection from '@/components/sections/DesignIntroSection'

describe('DesignIntroSection', () => {
  it('renders the section with the correct id', () => {
    render(<DesignIntroSection />)
    expect(document.getElementById('design-intro')).toBeInTheDocument()
  })

  it('renders the section label', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Interior')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Espaço para todas as suas aventuras.')).toBeInTheDocument()
  })

  it('renders the car image with correct alt text', () => {
    render(<DesignIntroSection />)
    const img = screen.getByAltText('Nissan Leaf — vista de cima')
    expect(img).toBeInTheDocument()
  })

  it('applies --text-display CSS variable to the heading', () => {
    render(<DesignIntroSection />)
    const heading = screen.getByText('Espaço para todas as suas aventuras.')
    expect(heading.style.fontSize).toBe('var(--text-display)')
  })

  it('eyebrow label has text-base class (not text-3xl)', () => {
    render(<DesignIntroSection />)
    const eyebrow = screen.getByText('Interior')
    expect(eyebrow.className).toContain('text-base')
    expect(eyebrow.className).not.toContain('text-3xl')
  })
})
