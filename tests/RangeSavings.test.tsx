// tests/RangeSavings.test.tsx
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

import RangeSavings from '@/components/sections/RangeSavings'

describe('RangeSavings', () => {
  it('renders the section heading', () => {
    render(<RangeSavings />)
    expect(
      screen.getByText('Uma bateria que vai onde tu vais.')
    ).toBeInTheDocument()
  })

  it('renders all four stat descriptors', () => {
    render(<RangeSavings />)
    expect(screen.getByText('Capacidade da bateria')).toBeInTheDocument()
    expect(screen.getByText('Autonomia em ciclo WLTP')).toBeInTheDocument()
    expect(screen.getByText('De 20 a 80% em carga rápida')).toBeInTheDocument()
    expect(screen.getByText('Eficiência energética')).toBeInTheDocument()
  })

  it('renders the battery SVG icon', () => {
    const { container } = render(<RangeSavings />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<RangeSavings />)
    expect(
      screen.getByRole('button', { name: /Calcular a minha poupança/i })
    ).toBeInTheDocument()
  })
})
