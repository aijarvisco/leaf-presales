import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt, fill, priority, sizes, quality, placeholder, blurDataURL, onLoad, onError, ...props
  }: {
    alt: string; fill?: boolean; priority?: boolean; sizes?: string; quality?: number;
    placeholder?: string; blurDataURL?: string; onLoad?: () => void; onError?: () => void;
    [key: string]: unknown
  }) => React.createElement('img', { alt, ...props }),
}))

// Canvas360Viewer uses canvas APIs not available in jsdom
jest.mock('@/components/configurator/Canvas360Viewer', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-360-viewer" />,
}))

import ImagePanel from '@/components/configurator/ImagePanel'

const baseProps = {
  exteriorImageSrc: '/exterior.jpg',
  view: 'exterior' as const,
  onViewChange: jest.fn(),
  slideIndex: 0,
  onSlideChange: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('ImagePanel — default state (exterior)', () => {
  it('renders the Vista 360 button', () => {
    render(<ImagePanel {...baseProps} />)
    expect(screen.getByRole('button', { name: /vista 360/i })).toBeInTheDocument()
  })

  it('renders the Exterior/Interior toggle', () => {
    render(<ImagePanel {...baseProps} />)
    expect(screen.getByRole('button', { name: /exterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /interior/i })).toBeInTheDocument()
  })

  it('calls onViewChange("360") when Vista 360 is clicked', () => {
    const onViewChange = jest.fn()
    render(<ImagePanel {...baseProps} onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    expect(onViewChange).toHaveBeenCalledWith('360')
  })
})

describe('ImagePanel — 360 state', () => {
  const props360 = { ...baseProps, view: '360' as const }

  it('renders Canvas360Viewer', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  })

  it('renders the Close button', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('does not render the Exterior/Interior toggle', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.queryByRole('button', { name: /^exterior$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^interior$/i })).not.toBeInTheDocument()
  })

  it('does not render the Vista 360 button', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.queryByRole('button', { name: /vista 360/i })).not.toBeInTheDocument()
  })

  it('calls onViewChange("exterior") when Close is clicked', () => {
    const onViewChange = jest.fn()
    render(<ImagePanel {...props360} onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onViewChange).toHaveBeenCalledWith('exterior')
  })
})
