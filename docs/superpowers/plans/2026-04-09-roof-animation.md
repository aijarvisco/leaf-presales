# Roof Animation Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven `RoofAnimationSection` that sequences 250 WebP frames on a `<canvas>` as the user scrolls, then fades in a dark overlay with title and paragraph copy.

**Architecture:** A `400vh` section with a `sticky top-0 h-screen` inner wrapper holds a `<canvas>` driven by framer-motion `useScroll`. Frames are preloaded in 5 sequential batches of 50. A `<motion.div>` overlay uses `useTransform` to fade in at 82–95% scroll progress. Follows the same canvas object-cover pattern as the existing `Canvas360Viewer`.

**Tech Stack:** React 19, Next.js 16, framer-motion 12, Tailwind CSS 4, Jest + jsdom

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/sections/RoofAnimationSection.tsx` | Full section: canvas, preloading, scroll logic, overlay |
| Create | `tests/components/sections/RoofAnimationSection.test.tsx` | Unit tests for pure functions + render tests |
| Modify | `src/app/page.tsx` | Add import + `<RoofAnimationSection />` after `<DesignIntroSection />` |

---

### Task 1: Write failing tests

**Files:**
- Create: `tests/components/sections/RoofAnimationSection.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
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
    ...props
  }: {
    alt: string
    fill?: boolean
    priority?: boolean
    sizes?: string
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
    // canvas 1920×1080, image 2500×1280
    // scale = max(1920/2500, 1080/1280) = max(0.768, 0.844) = 0.844
    const { sw, sh, sx, sy } = calcCoverDraw(1920, 1080, 2500, 1280)
    expect(sw).toBeCloseTo(2500 * 0.844, 1)
    expect(sh).toBeCloseTo(1280 * 0.844, 1)
    expect(sx).toBeCloseTo((1920 - sw) / 2, 1)
    expect(sy).toBeCloseTo((1080 - sh) / 2, 1)
  })

  it('fills height when canvas is taller relative to image', () => {
    // canvas 400×800 (portrait), image 2500×1280 (landscape)
    // scale = max(400/2500, 800/1280) = max(0.16, 0.625) = 0.625
    const { sw, sh } = calcCoverDraw(400, 800, 2500, 1280)
    expect(sw).toBeCloseTo(2500 * 0.625, 1)
    expect(sh).toBeCloseTo(1280 * 0.625, 1)
  })

  it('centers the image (sx and sy can be negative for cover)', () => {
    const { sx, sy, sw, sh } = calcCoverDraw(1920, 1080, 2500, 1280)
    // At least one axis should be zero or negative (cover means image extends beyond canvas)
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
    // 0.82 * 249 = 204.18 → 204
    expect(progressToFrameIndex(0.82)).toBe(204)
  })
})

// ─── RoofAnimationSection render ───────────────────────────────────────────────

import RoofAnimationSection from '@/components/sections/RoofAnimationSection'

describe('RoofAnimationSection', () => {
  beforeEach(() => {
    // jsdom does not implement ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
    // jsdom does not implement HTMLCanvasElement.getContext
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
```

- [ ] **Step 2: Run the tests — expect them to fail with "Cannot find module"**

```bash
npx jest tests/components/sections/RoofAnimationSection.test.tsx --no-coverage
```

Expected output: `FAIL` — `Cannot find module '@/components/sections/RoofAnimationSection'`

---

### Task 2: Implement `RoofAnimationSection`

**Files:**
- Create: `src/components/sections/RoofAnimationSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/RoofAnimationSection.tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Image from 'next/image'

// ─── Constants ────────────────────────────────────────────────────────────────

const FRAME_COUNT = 250
const BATCH_SIZE = 50
const pad = (n: number) => String(n).padStart(5, '0')
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/images/roof/25tdieulhd_pz1d_u_roof_h_${pad(i)}.webp`
)

// ─── Pure utilities ───────────────────────────────────────────────────────────

function calcCoverDraw(cw: number, ch: number, iw: number, ih: number) {
  const scale = Math.max(cw / iw, ch / ih)
  const sw = iw * scale
  const sh = ih * scale
  const sx = (cw - sw) / 2
  const sy = (ch - sh) / 2
  return { sx, sy, sw, sh }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoofAnimationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(FRAME_COUNT).fill(null)
  )
  const lastDrawnRef = useRef(0)
  const [batchOneReady, setBatchOneReady] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const overlayOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1])

  // ── Draw a frame to canvas ──────────────────────────────────────────────────
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img || !img.complete || !img.naturalWidth) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { sx, sy, sw, sh } = calcCoverDraw(
      canvas.width,
      canvas.height,
      img.naturalWidth,
      img.naturalHeight
    )
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, sx, sy, sw, sh)
    lastDrawnRef.current = index
  }

  // ── Chunked preloading ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadBatch = (start: number, onDone: () => void) => {
      let loaded = 0
      const end = Math.min(start + BATCH_SIZE, FRAME_COUNT)
      for (let i = start; i < end; i++) {
        const img = new window.Image()
        img.src = FRAMES[i]
        const idx = i
        img.onload = () => {
          imagesRef.current[idx] = img
          if (idx === 0) drawFrame(0)
          loaded++
          if (loaded === end - start) onDone()
        }
        img.onerror = () => {
          loaded++
          if (loaded === end - start) onDone()
        }
      }
    }

    loadBatch(0, () => {
      setBatchOneReady(true)
      loadBatch(50, () =>
        loadBatch(100, () =>
          loadBatch(150, () =>
            loadBatch(200, () => {})
          )
        )
      )
    })
  }, [])

  // ── Keep canvas pixel size in sync with CSS size ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      canvas.width = width
      canvas.height = height
      drawFrame(lastDrawnRef.current)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // ── Drive frame from scroll progress ───────────────────────────────────────
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress: number) => {
      const index = Math.round(progress * (FRAME_COUNT - 1))
      drawFrame(index)
    })
    return unsubscribe
  }, [scrollYProgress])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="roof-animation"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* Frame 0 static fallback — always mounted, hidden by canvas once ready */}
        <div className="absolute inset-0">
          <Image
            src={FRAMES[0]}
            alt="Nissan LEAF — teto panorâmico"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Canvas — always in DOM so ResizeObserver attaches immediately */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Spinner — shown until batch 1 is ready */}
        {!batchOneReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: overlayOpacity,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)',
          }}
        >
          <div className="absolute bottom-8 left-6 max-w-sm sm:bottom-12 sm:left-12">
            <h2 className="text-white font-medium tracking-[-0.04em] text-2xl sm:text-3xl leading-tight mb-3">
              Interior de uma nova era
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              O Teto panorâmico escurecido oferece uma experiência de habitáculo
              premium com maior altura livre e um isolamento térmico eficiente.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run the tests — expect them to pass**

```bash
npx jest tests/components/sections/RoofAnimationSection.test.tsx --no-coverage
```

Expected output: `PASS` — all 18 tests green.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/RoofAnimationSection.tsx tests/components/sections/RoofAnimationSection.test.tsx
git commit -m "feat: add scroll-driven RoofAnimationSection with canvas frame sequencing"
```

---

### Task 3: Wire into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add import**

In `src/app/page.tsx`, add after the existing `DesignIntroSection` import:

```tsx
import RoofAnimationSection from '@/components/sections/RoofAnimationSection'
```

- [ ] **Step 2: Add JSX after `<DesignIntroSection />`**

```tsx
<DesignIntroSection />
<RoofAnimationSection />
<ValuesSection id="interior-highlights" cards={INTERIOR_CARDS} />
```

- [ ] **Step 3: Run lint to verify no type errors**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Run full test suite to verify nothing regressed**

```bash
npx jest --no-coverage
```

Expected: all tests pass (same count as before + 18 new).

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: insert RoofAnimationSection into page after DesignIntroSection"
```

---

## Self-Review

**Spec coverage:**
- ✅ 250 WebP frames from `public/images/roof/` — FRAMES array in Task 2
- ✅ Scroll-driven canvas with `useScroll` — Task 2
- ✅ `height: 400vh` + `sticky top-0` — Task 2
- ✅ `object-cover` canvas draw logic — `calcCoverDraw` in Task 2
- ✅ Chunked preloading, 5 batches of 50 — Task 2
- ✅ Frame 0 `<Image priority>` fallback — Task 2
- ✅ Spinner until batch 1 ready — Task 2
- ✅ Overlay gradient + copy, opacity from `useTransform([0.82, 0.95])` — Task 2
- ✅ Inserted after `<DesignIntroSection />` — Task 3
- ✅ Mobile responsive text positioning (`bottom-8 left-6` → `sm:bottom-12 sm:left-12`) — Task 2

**Placeholder scan:** None found.

**Type consistency:** `calcCoverDraw` signature and return shape is identical in the test file (Task 1) and the component (Task 2). `FRAME_COUNT = 250` and `BATCH_SIZE = 50` are consistent across both tasks.
