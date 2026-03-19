# Configurador 360 Viewer Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Configurador section with a full-viewport, canvas-based 360° image sequence viewer with drag-to-rotate and inertia for the exterior, and a placeholder image for the interior.

**Architecture:** A canvas element renders pre-loaded PNG frames on demand; drag events accumulate into a floating-point frame index; on release, a `requestAnimationFrame` inertia loop decays velocity until it drops below threshold. Both Exterior and Interior views stay mounted simultaneously; Framer Motion crossfades between them by toggling opacity.

**Tech Stack:** React 18, Next.js App Router, TypeScript, Framer Motion, Tailwind CSS, Jest + jsdom

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/types/index.ts` | Remove `ConfiguratorMode` type |
| Delete | `src/components/configurator/ImageSequenceViewer.tsx` | Replaced by Canvas360Viewer |
| Delete | `src/components/configurator/ThreeDViewer.tsx` | Not used in this phase |
| Delete | `src/components/configurator/ColorSwitcher.tsx` | Not needed in this phase |
| Create | `src/components/configurator/InteriorViewer.tsx` | Full-bleed placeholder image |
| Create | `src/components/configurator/Canvas360Viewer.tsx` | Frame preload, canvas render, drag + inertia |
| Rewrite | `src/components/configurator/ConfiguratorViewer.tsx` | Route to exterior/interior with crossfade |
| Rewrite | `src/components/sections/Configurator.tsx` | Full-bleed shell, badge, tab toggle |
| Create | `tests/components/configurator/Canvas360Viewer.test.ts` | Frame index arithmetic |

---

## Task 1: Remove obsolete types and files

**Files:**
- Modify: `src/types/index.ts`
- Delete: `src/components/configurator/ImageSequenceViewer.tsx`
- Delete: `src/components/configurator/ThreeDViewer.tsx`
- Delete: `src/components/configurator/ColorSwitcher.tsx`

- [ ] **Step 1: Remove `ConfiguratorMode` from types**

Open `src/types/index.ts` and delete this line:
```ts
export type ConfiguratorMode = '3d' | 'image-sequence'
```

- [ ] **Step 2: Delete the three obsolete component files**

```bash
rm src/components/configurator/ImageSequenceViewer.tsx
rm src/components/configurator/ThreeDViewer.tsx
rm src/components/configurator/ColorSwitcher.tsx
```

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (nothing imports these deleted files in non-deleted code).

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/components/configurator/
git commit -m "chore: remove obsolete configurator files and ConfiguratorMode type"
```

---

## Task 2: Create `InteriorViewer`

**Files:**
- Create: `src/components/configurator/InteriorViewer.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/configurator/InteriorViewer.tsx
'use client'

interface InteriorViewerProps {
  images?: string[]
}

export default function InteriorViewer({ images: _ }: InteriorViewerProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/nissan-leaf-lights.jpg"
        alt="Interior view"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/configurator/InteriorViewer.tsx
git commit -m "feat: add InteriorViewer placeholder component"
```

---

## Task 3: Write frame index arithmetic tests

**Files:**
- Create: `tests/components/configurator/Canvas360Viewer.test.ts`

These tests verify the pure math functions before wiring them into a canvas component.

- [ ] **Step 1: Write the tests**

```ts
// tests/components/configurator/Canvas360Viewer.test.ts

const FRAME_COUNT = 104
const SENSITIVITY = 0.25

function wrapFrame(raw: number): number {
  return ((Math.round(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

function accumulateFrameIndex(current: number, deltaPixels: number): number {
  return current + deltaPixels * SENSITIVITY
}

describe('wrapFrame', () => {
  it('returns 0 for 0', () => {
    expect(wrapFrame(0)).toBe(0)
  })

  it('wraps forward past FRAME_COUNT', () => {
    expect(wrapFrame(104)).toBe(0)
    expect(wrapFrame(105)).toBe(1)
  })

  it('wraps backward (negative index)', () => {
    expect(wrapFrame(-1)).toBe(103)
    expect(wrapFrame(-104)).toBe(0)
  })

  it('handles floating point input by rounding', () => {
    expect(wrapFrame(0.4)).toBe(0)
    expect(wrapFrame(0.6)).toBe(1)
  })
})

describe('accumulateFrameIndex', () => {
  it('advances by SENSITIVITY * delta pixels', () => {
    expect(accumulateFrameIndex(0, 4)).toBeCloseTo(1)
    expect(accumulateFrameIndex(0, 8)).toBeCloseTo(2)
  })

  it('goes negative on leftward drag', () => {
    expect(accumulateFrameIndex(10, -4)).toBeCloseTo(9)
  })

  it('accumulates across multiple calls', () => {
    let idx = 0
    idx = accumulateFrameIndex(idx, 4)
    idx = accumulateFrameIndex(idx, 4)
    expect(idx).toBeCloseTo(2)
  })
})
```

- [ ] **Step 2: Run tests and confirm they pass**

```bash
npx jest tests/components/configurator/Canvas360Viewer.test.ts --no-coverage
```

Expected: all 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/components/configurator/Canvas360Viewer.test.ts
git commit -m "test: add frame index arithmetic tests for Canvas360Viewer"
```

---

## Task 4: Create `Canvas360Viewer`

**Files:**
- Create: `src/components/configurator/Canvas360Viewer.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/configurator/Canvas360Viewer.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

// --- Constants ---
const SENSITIVITY = 0.25        // frames per pixel dragged
const DAMPING = 0.92            // velocity decay per rAF frame
const VELOCITY_THRESHOLD = 0.005 // px/ms — inertia stops below this
const FRAME_COUNT = 104

// --- Frame URL array ---
const encode = (name: string) => `/images/360/${encodeURIComponent(name)}`
const FRAMES: string[] = [
  encode('filters-quality-60-.png'),
  ...Array.from({ length: 103 }, (_, i) => encode(`filters-quality-60- (${i + 1}).png`)),
]

function wrapFrame(raw: number): number {
  return ((Math.round(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

interface Canvas360ViewerProps {
  onFirstInteraction?: () => void
}

export default function Canvas360Viewer({ onFirstInteraction }: Canvas360ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameAccRef = useRef(0)       // floating-point frame accumulator
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)          // px/ms
  const rafId = useRef<number | null>(null)
  const hasInteracted = useRef(false)

  const [loading, setLoading] = useState(true)

  // Draw the current frame to canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  // Preload all frames
  useEffect(() => {
    let loaded = 0
    const imgs: HTMLImageElement[] = FRAMES.map((src, i) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        // Draw frame 0 immediately when it loads
        if (i === 0) drawFrame(0)
        loaded++
        if (loaded === FRAME_COUNT) setLoading(false)
      }
      return img
    })
    imagesRef.current = imgs
  }, [])

  // ResizeObserver: keep canvas pixel dims in sync with CSS size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      canvas.width = width
      canvas.height = height
      drawFrame(wrapFrame(frameAccRef.current))
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Cancel inertia loop on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const startInertia = (initialVelocity: number) => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    let vel = initialVelocity
    let last = performance.now()

    const step = (now: number) => {
      const elapsed = now - last
      last = now
      vel *= DAMPING
      if (Math.abs(vel) < VELOCITY_THRESHOLD) return
      frameAccRef.current += vel * elapsed
      drawFrame(wrapFrame(frameAccRef.current))
      rafId.current = requestAnimationFrame(step)
    }
    rafId.current = requestAnimationFrame(step)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    isDragging.current = true
    lastX.current = e.clientX
    lastTime.current = e.timeStamp
    velocity.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    // Fire onFirstInteraction once on first actual move
    if (!hasInteracted.current && onFirstInteraction) {
      hasInteracted.current = true
      onFirstInteraction()
    }

    const dx = e.clientX - lastX.current
    const dt = e.timeStamp - lastTime.current
    if (dt > 0) velocity.current = dx / dt

    frameAccRef.current += dx * SENSITIVITY
    drawFrame(wrapFrame(frameAccRef.current))

    lastX.current = e.clientX
    lastTime.current = e.timeStamp
  }

  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    startInertia(velocity.current)
  }

  return (
    <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/configurator/Canvas360Viewer.tsx
git commit -m "feat: add Canvas360Viewer with preload, drag-to-rotate, and inertia"
```

---

## Task 5: Rewrite `ConfiguratorViewer`

**Files:**
- Rewrite: `src/components/configurator/ConfiguratorViewer.tsx`

- [ ] **Step 1: Rewrite the component**

```tsx
// src/components/configurator/ConfiguratorViewer.tsx
'use client'
import { motion } from 'framer-motion'
import type { ConfiguratorView } from '@/types'
import Canvas360Viewer from './Canvas360Viewer'
import InteriorViewer from './InteriorViewer'

interface ConfiguratorViewerProps {
  view: ConfiguratorView
  onFirstInteraction?: () => void
}

export default function ConfiguratorViewer({ view, onFirstInteraction }: ConfiguratorViewerProps) {
  return (
    <div className="relative w-full h-full">
      {/* Exterior — stays mounted */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: view === 'exterior' ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: view === 'exterior' ? 'auto' : 'none' }}
      >
        <Canvas360Viewer onFirstInteraction={onFirstInteraction} />
      </motion.div>

      {/* Interior — stays mounted */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: view === 'interior' ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: view === 'interior' ? 'auto' : 'none' }}
      >
        <InteriorViewer />
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/configurator/ConfiguratorViewer.tsx
git commit -m "feat: rewrite ConfiguratorViewer with crossfade between exterior and interior"
```

---

## Task 6: Rewrite `Configurator` section shell

**Files:**
- Rewrite: `src/components/sections/Configurator.tsx`

- [ ] **Step 1: Rewrite the component**

```tsx
// src/components/sections/Configurator.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ConfiguratorViewer from '@/components/configurator/ConfiguratorViewer'
import type { ConfiguratorView } from '@/types'

const VIEWS: { id: ConfiguratorView; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
]

export default function Configurator() {
  const [view, setView] = useState<ConfiguratorView>('exterior')
  const [badgeVisible, setBadgeVisible] = useState(true)

  return (
    <section id="configurador" className="relative min-h-screen w-full overflow-hidden">
      {/* Full-bleed viewer */}
      <div className="absolute inset-0">
        <ConfiguratorViewer
          view={view}
          onFirstInteraction={() => setBadgeVisible(false)}
        />
      </div>

      {/* 360° badge — top-left */}
      <motion.div
        className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full pointer-events-none"
        animate={{ opacity: badgeVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 8h12M2 8l3-3M2 8l3 3M14 8l-3-3M14 8l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>360°</span>
      </motion.div>

      {/* View toggle — bottom-center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${view === id ? 'bg-white text-black' : 'text-white/70 hover:text-white'}
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Check TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`, scroll to the Configurador section and verify:
- Section is full viewport height, edge-to-edge
- Car renders immediately (frame 0), spinner shows briefly
- Dragging rotates the car smoothly; releasing triggers inertia spin-down
- `360°` badge fades out after first drag movement
- Clicking Interior crossfades to the placeholder image
- Clicking Exterior crossfades back to the 360 view (no reloading, already mounted)
- Works on mobile (touch drag rotates car)

- [ ] **Step 4: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass (including the frame arithmetic tests from Task 3).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Configurator.tsx
git commit -m "feat: redesign Configurador as full-viewport 360 viewer with drag-to-rotate and inertia"
```
