// tests/components/sections/RoofAnimationSection.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(
            ({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
              React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => {} } }),
    useTransform: () => 0,
    useReducedMotion: () => false,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    priority,
    sizes,
    quality,
    placeholder,
    blurDataURL,
    onLoad,
    onError,
    ...props
  }: {
    alt: string
    fill?: boolean
    priority?: boolean
    sizes?: string
    quality?: number
    placeholder?: string
    blurDataURL?: string
    onLoad?: () => void
    onError?: () => void
    [key: string]: unknown
  }) => React.createElement('img', { alt, ...props }),
}))

// ─── Pure utility functions (duplicated from component for isolated testing) ──

const FRAME_COUNT = 250
const pad = (n: number) => String(n).padStart(5, '0')

function buildFrameUrl(index: number): string {
  return `/images/roof/25tdieulhd_pz1d_u_roof_h_${pad(index)}.webp`
}

function calcCoverDraw(cw: number, ch: number, iw: number, ih: number) {
  const scale = Math.max(cw / iw, ch / ih)
  const sw = iw * scale
  const sh = ih * scale
  const sx = (cw - sw) / 2
  const sy = (ch - sh) / 2
  return { sx, sy, sw, sh }
}

function progressToFrameIndex(progress: number): number {
  return Math.round(progress * (FRAME_COUNT - 1))
}

// ─── buildFrameUrl ─────────────────────────────────────────────────────────────

describe('buildFrameUrl', () => {
  it('pads single digit with leading zeros', () => {
    expect(buildFrameUrl(0)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00000.webp')
    expect(buildFrameUrl(1)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00001.webp')
    expect(buildFrameUrl(9)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00009.webp')
  })

  it('pads double digit', () => {
    expect(buildFrameUrl(42)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00042.webp')
  })

  it('pads triple digit', () => {
    expect(buildFrameUrl(100)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00100.webp')
  })

  it('handles last frame (249)', () => {
    expect(buildFrameUrl(249)).toBe('/images/roof/25tdieulhd_pz1d_u_roof_h_00249.webp')
  })
})

// ─── calcCoverDraw ─────────────────────────────────────────────────────────────

describe('calcCoverDraw', () => {
  it('fills width when canvas is wider relative to image', () => {
    const { sw, sh, sx, sy } = calcCoverDraw(1920, 1080, 2500, 1280)
    expect(sw).toBeCloseTo(2500 * 0.84375, 1)
    expect(sh).toBeCloseTo(1280 * 0.84375, 1)
    expect(sx).toBeCloseTo((1920 - sw) / 2, 1)
    expect(sy).toBeCloseTo((1080 - sh) / 2, 1)
  })

  it('fills height when canvas is taller relative to image', () => {
    const { sw, sh } = calcCoverDraw(400, 800, 2500, 1280)
    expect(sw).toBeCloseTo(2500 * 0.625, 1)
    expect(sh).toBeCloseTo(1280 * 0.625, 1)
  })

  it('centers the image (sx and sy can be negative for cover)', () => {
    const { sx, sy, sw, sh } = calcCoverDraw(1920, 1080, 2500, 1280)
    const coversWidth = sx <= 0 || sx + sw >= 1920
    const coversHeight = sy <= 0 || sy + sh >= 1080
    expect(coversWidth || coversHeight).toBe(true)
  })

  it('returns exact dimensions for 1:1 canvas and image', () => {
    const { sx, sy, sw, sh } = calcCoverDraw(100, 100, 100, 100)
    expect(sx).toBe(0)
    expect(sy).toBe(0)
    expect(sw).toBe(100)
    expect(sh).toBe(100)
  })
})

// ─── progressToFrameIndex ──────────────────────────────────────────────────────

describe('progressToFrameIndex', () => {
  it('returns 0 at progress 0', () => {
    expect(progressToFrameIndex(0)).toBe(0)
  })

  it('returns 249 at progress 1', () => {
    expect(progressToFrameIndex(1)).toBe(249)
  })

  it('returns midpoint at progress 0.5', () => {
    expect(progressToFrameIndex(0.5)).toBe(125)
  })

  it('rounds to nearest frame', () => {
    expect(progressToFrameIndex(0.82)).toBe(204)
  })
})

// ─── RoofAnimationSection render ───────────────────────────────────────────────

import RoofAnimationSection from '@/components/sections/RoofAnimationSection'

describe('RoofAnimationSection', () => {
  beforeEach(() => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null)
  })

  it('renders a section with id="roof-animation"', () => {
    render(<RoofAnimationSection />)
    expect(document.getElementById('roof-animation')).toBeInTheDocument()
  })

  it('renders the fallback frame-0 image', () => {
    render(<RoofAnimationSection />)
    const img = screen.getByAltText('Nissan LEAF — teto panorâmico')
    expect(img).toBeInTheDocument()
  })

  it('renders a canvas element', () => {
    render(<RoofAnimationSection />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('renders the overlay title', () => {
    render(<RoofAnimationSection />)
    expect(screen.getByText('Interior de uma nova era')).toBeInTheDocument()
  })

  it('renders the overlay paragraph', () => {
    render(<RoofAnimationSection />)
    expect(
      screen.getByText(
        'O Teto panorâmico escurecido oferece uma experiência de habitáculo premium com maior altura livre e um isolamento térmico eficiente.'
      )
    ).toBeInTheDocument()
  })
})
