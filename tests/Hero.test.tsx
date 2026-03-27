import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Framer Motion uses browser APIs not available in jsdom.
// Mock the parts Hero uses so the test focuses on markup, not animation.
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

import Hero from '@/components/sections/Hero'

describe('Hero', () => {
  it('renders headline copy', () => {
    render(<Hero />)
    expect(screen.getByText('Espaço para todas as suas aventuras')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<Hero />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
  })
})
