import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

jest.mock('@/components/configurator/Canvas360Viewer', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'canvas-360-viewer' }),
}))

// Mock ReservationDrawer so tests don't need Stripe context
jest.mock('@/components/ui/ReservationDrawer', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen
      ? React.createElement('div', { 'data-testid': 'reservation-drawer' },
          React.createElement('button', { onClick: onClose }, 'Fechar')
        )
      : null,
}))

// jsdom doesn't implement ResizeObserver — provide a no-op stub
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

import Configurador from '@/components/sections/Configurador'

describe('Configurador', () => {
  it('renders with id="configurador"', () => {
    const { container } = render(<Configurador />)
    expect(container.querySelector('#configurador')).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<Configurador />)
    expect(screen.getByText('Escolhe a tua versão.')).toBeInTheDocument()
  })

  it('renders all 3 version buttons', () => {
    render(<Configurador />)
    expect(screen.getByRole('tab', { name: /engage/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /evolve/i })).toBeInTheDocument()
  })

  it('renders the CTA bar with default version Engage', () => {
    render(<Configurador />)
    expect(screen.getAllByText(/engage/i).length).toBeGreaterThan(0)
  })

  it('renders the Tenho Interesse CTA button', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders the Vista 360 button', () => {
    render(<Configurador />)
    expect(screen.getByRole('button', { name: /vista 360/i })).toBeInTheDocument()
  })

  it('clicking Vista 360 shows the 360 viewer', () => {
    render(<Configurador />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  })

  it('clicking a color while in 360 view closes the 360 viewer', () => {
    render(<Configurador />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /midnight black/i }))
    expect(screen.queryByTestId('canvas-360-viewer')).not.toBeInTheDocument()
  })

  it('clicking Tenho Interesse opens the reservation drawer', () => {
    render(<Configurador />)
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
  })

  it('closing the drawer hides it', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    fireEvent.click(buttons[0])
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Fechar'))
    expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  })
})

describe('Configurador — drawer events', () => {
  let receivedEvents: string[] = []

  beforeEach(() => {
    receivedEvents = []
    const handler = (e: Event) => receivedEvents.push(e.type)
    window.addEventListener('reservationdrawer:open', handler)
    window.addEventListener('reservationdrawer:close', handler)
    ;(window as Window & { __testHandler?: EventListener }).__testHandler = handler
  })

  afterEach(() => {
    const h = (window as Window & { __testHandler?: EventListener }).__testHandler
    if (h) {
      window.removeEventListener('reservationdrawer:open', h)
      window.removeEventListener('reservationdrawer:close', h)
    }
  })

  it('does not dispatch reservationdrawer:open on initial mount', () => {
    render(<Configurador />)
    expect(receivedEvents).not.toContain('reservationdrawer:open')
  })

  it('dispatches reservationdrawer:open when the reserve button is clicked', async () => {
    render(<Configurador />)
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    })
    expect(receivedEvents).toContain('reservationdrawer:open')
  })

  it('dispatches reservationdrawer:close when the drawer is closed', async () => {
    render(<Configurador />)
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    })
    expect(receivedEvents).toContain('reservationdrawer:close')
  })
})
