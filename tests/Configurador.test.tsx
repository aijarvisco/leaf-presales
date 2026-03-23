import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock framer-motion (same pattern as Hero.test.tsx)
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  }
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, fill, priority, sizes, quality, placeholder, blurDataURL, onLoad, onError, ...props }: { alt: string; fill?: boolean; priority?: boolean; sizes?: string; quality?: number; placeholder?: string; blurDataURL?: string; onLoad?: () => void; onError?: () => void; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import Configurador from '@/components/sections/Configurador'

describe('Configurador', () => {
  it('renders with id="configurador"', () => {
    const { container } = render(<Configurador onSelectVersion={jest.fn()} />)
    expect(container.querySelector('#configurador')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getByText('Escolhe a tua versão.')).toBeInTheDocument()
  })

  it('renders all 3 version buttons', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getByText('Visia')).toBeInTheDocument()
    expect(screen.getAllByText('N-Connecta').length).toBeGreaterThan(0)
    expect(screen.getByText('Tekna')).toBeInTheDocument()
  })

  it('calls onSelectVersion when a version tab is clicked', () => {
    const onSelectVersion = jest.fn()
    render(<Configurador onSelectVersion={onSelectVersion} />)
    fireEvent.click(screen.getByText('Tekna'))
    expect(onSelectVersion).toHaveBeenCalledWith('tekna')
  })

  it('renders the sticky bar with default version N-Connecta', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    expect(screen.getAllByText('N-Connecta').length).toBeGreaterThan(0)
  })

  it('renders the Reservar agora CTA button', () => {
    render(<Configurador onSelectVersion={jest.fn()} />)
    const buttons = screen.getAllByRole('button', { name: /reservar agora/i })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
