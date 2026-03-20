# Values Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mixed-width horizontal carousel section ("Values") positioned between AutonomiaSectionV2 and Configurator, with a centered title block and four cards (1 landscape 16:9 + 3 portrait 9:16) that show text below the image.

**Architecture:** Two new files — a presentational `ValuesCard` UI component and a `ValuesSection` section component — plus a one-line insertion in `page.tsx`. The carousel reuses the exact same interaction pattern (pointer drag, wheel, spring animation, pagination) as the existing `Highlights` component, adapted for mixed-width cards.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Framer Motion (`useMotionValue`, `animate`, `motion`), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-values-section-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/ui/ValuesCard.tsx` | Stateless card: image container + text below |
| Create | `src/components/sections/ValuesSection.tsx` | Title block + mixed-width carousel |
| Modify | `src/app/page.tsx` | Insert `<ValuesSection />` between lines 19–20 |

---

## Task 1: `ValuesCard` — presentational card component

**Files:**
- Create: `src/components/ui/ValuesCard.tsx`

This component renders a rounded image container (using `<Image fill>`) with a text block beneath it. No overlay, no gradient. Width and height are passed as numbers and applied to the wrapper `div` via `style` — NOT to `<Image>` itself (which uses `fill` mode and resolves dimensions from its parent).

- [ ] **Step 1: Create `ValuesCard.tsx`**

```tsx
// src/components/ui/ValuesCard.tsx
import Image from 'next/image'

interface ValuesCardProps {
  imageSrc: string
  imageAlt: string
  boldText: string
  bodyText: string
  width: number   // applied to wrapper div — NOT to <Image>
  height: number  // applied to wrapper div — NOT to <Image>
}

export default function ValuesCard({
  imageSrc,
  imageAlt,
  boldText,
  bodyText,
  width,
  height,
}: ValuesCardProps) {
  return (
    <div className="flex flex-col select-none" style={{ width }}>
      {/* Image container — fill requires position:relative + explicit dimensions */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ width, height }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Text below image */}
      <div className="mt-4">
        <p className="text-[17px] leading-snug text-[#0A0A0A]">
          <strong className="font-medium">{boldText}</strong>{' '}
          <span className="font-normal text-[#3a3a3a] text-[15px]">{bodyText}</span>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the dev server renders without errors**

Run: `npm run dev` (already running, or start it)
Open: `http://localhost:3000`
Expected: No console errors. (ValuesCard is not mounted yet — this just verifies the file compiles.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ValuesCard.tsx
git commit -m "feat: add ValuesCard UI component"
```

---

## Task 2: `ValuesSection` — title block + mixed-width carousel

**Files:**
- Create: `src/components/sections/ValuesSection.tsx`

Key implementation notes before writing:

**Constants (module-level, not inside the component):**
```ts
const CARD_HEIGHT  = 480
const WIDE_WIDTH   = Math.round(CARD_HEIGHT * 16 / 9)  // 853
const NARROW_WIDTH = Math.round(CARD_HEIGHT * 9 / 16)   // 270
const GAP          = 20
```

**Card positions (track-relative px):**
```
pos[0] = 0
pos[1] = WIDE_WIDTH + GAP                            // 873
pos[2] = WIDE_WIDTH + GAP + NARROW_WIDTH + GAP       // 1163
pos[3] = WIDE_WIDTH + GAP + (NARROW_WIDTH + GAP) * 2 // 1453
```
Closed form for i ≥ 1: `pos[i] = WIDE_WIDTH + GAP + (i - 1) * (NARROW_WIDTH + GAP)`

**`getOffset(index)` — verified numerically in the spec:**
```ts
// index 0 → containerLeft (aligns wide card to container)
// index 1 → WIDE_WIDTH * 0.10 - WIDE_WIDTH       ≈ −768
// index 2 → NARROW_WIDTH * 0.25 - WIDE_WIDTH - 1 * (NARROW_WIDTH + GAP)  ≈ −1075
// index 3 → NARROW_WIDTH * 0.25 - WIDE_WIDTH - 2 * (NARROW_WIDTH + GAP)  ≈ −1365
```

**Drag commit — two paths (same logic as `Highlights`):**
1. `|velocity| > 300` → commit in velocity direction
2. `|delta| > NARROW_WIDTH / 4` → commit in drag direction

**`viewportWidth` hydration guard:** initialise to `0`, set in `useEffect`. Only affects `containerLeft`.

- [ ] **Step 1: Create `ValuesSection.tsx`**

```tsx
// src/components/sections/ValuesSection.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import ValuesCard from '@/components/ui/ValuesCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_HEIGHT  = 480
const WIDE_WIDTH   = Math.round(CARD_HEIGHT * 16 / 9)  // 853
const NARROW_WIDTH = Math.round(CARD_HEIGHT * 9 / 16)   // 270
const GAP          = 20
const CONTAINER_MAX = 1024  // max-w-5xl
const CONTAINER_PAD = 24    // px-6

const VALUES = [
  {
    imageSrc: '/images/nissan-leaf-hero.jpg',
    imageAlt: 'Nissan Leaf — garantia de bateria',
    boldText: '8 anos de garantia na bateria.',
    bodyText: 'A tua tranquilidade começa aqui — cobertura total para que te focuses no essencial: conduzir.',
    width: WIDE_WIDTH,
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Nissan Leaf — do quotidiano à escapadela',
    boldText: 'Do quotidiano à escapadela.',
    bodyText: 'Confortável na cidade e capaz na estrada — o Leaf adapta-se à tua vida.',
    width: NARROW_WIDTH,
  },
  {
    imageSrc: '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
    imageAlt: 'Nissan Leaf — carregamento fácil',
    boldText: 'Carrega sem complicações.',
    bodyText: 'Em casa, no trabalho ou na rede pública — a carga encaixa no teu ritmo.',
    width: NARROW_WIDTH,
  },
  {
    imageSrc: '/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png',
    imageAlt: 'Nissan Leaf — sempre ligado via app',
    boldText: 'Sempre ligado, onde estiveres.',
    bodyText: 'Com a app Nissan Connect tens o teu Leaf na palma da mão a qualquer momento.',
    width: NARROW_WIDTH,
  },
]

// Cumulative track-relative start position of each card
function cardPos(i: number): number {
  if (i === 0) return 0
  return WIDE_WIDTH + GAP + (i - 1) * (NARROW_WIDTH + GAP)
}

const springConfig = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.45 }

// ─── Component ────────────────────────────────────────────────────────────────

export default function ValuesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isWheeling = useRef(false)
  const isDragging = useRef(false)
  const pointerStartX = useRef(0)
  const xAtDragStart = useRef(0)

  const x = useMotionValue(0)

  // containerLeft: only viewport-dependent value — guarded against SSR
  const containerLeft = viewportWidth > 0
    ? Math.max((viewportWidth - CONTAINER_MAX) / 2, 0) + CONTAINER_PAD
    : 0

  function getOffset(index: number): number {
    if (index === 0) return containerLeft
    if (index === 1) return WIDE_WIDTH * 0.10 - WIDE_WIDTH
    return NARROW_WIDTH * 0.25 - (WIDE_WIDTH + (index - 1) * (NARROW_WIDTH + GAP))
  }

  const targetOffset = getOffset(activeIndex)

  useEffect(() => {
    animate(x, targetOffset, springConfig)
  }, [targetOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setViewportWidth(window.innerWidth)
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5 && Math.abs(e.deltaX) < 15) return
    e.preventDefault()
    if (isWheeling.current) return
    isWheeling.current = true

    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta > 20) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
    else if (delta < -20) setActiveIndex(i => Math.max(i - 1, 0))

    setTimeout(() => { isWheeling.current = false }, 550)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    pointerStartX.current = e.clientX
    xAtDragStart.current = x.get()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    x.set(xAtDragStart.current + (e.clientX - pointerStartX.current))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const delta = e.clientX - pointerStartX.current
    const vel = x.getVelocity()

    if (Math.abs(vel) > 300) {
      if (vel < 0) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else if (Math.abs(delta) > NARROW_WIDTH / 4) {
      if (delta < 0) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else {
      animate(x, targetOffset, springConfig)
    }
  }

  return (
    <section id="values" className="pt-48 pb-48 bg-white overflow-hidden">

      {/* Title block */}
      <div className="max-w-5xl mx-auto px-6 mb-20 text-center">
        <p className="font-normal text-[17px] text-[#86868b] mb-2">Values</p>
        <h2
          className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-tight"
          style={{ fontSize: '56px' }}
        >
          Designed to make a difference.
        </h2>
        <p className="mt-6 text-[17px] text-[#0A0A0A] max-w-2xl mx-auto leading-relaxed">
          <strong className="font-semibold">Our values lead the way.</strong>{' '}
          Apple Vision Pro was designed to help protect your privacy and keep you in control of your data. Its built‑in accessibility features are designed to work the way you do.
        </p>
      </div>

      {/* Carousel track */}
      <div
        ref={carouselRef}
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div className="flex flex-row items-start" style={{ gap: GAP, x }}>
          {VALUES.map((v) => (
            <div key={v.imageSrc} className="shrink-0">
              <ValuesCard
                imageSrc={v.imageSrc}
                imageAlt={v.imageAlt}
                boldText={v.boldText}
                bodyText={v.bodyText}
                width={v.width}
                height={CARD_HEIGHT}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setActiveIndex(i => Math.max(i - 1, 0))}
          disabled={activeIndex === 0}
          aria-label="Anterior"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-[6px]">
          {VALUES.map((_, i) => (
            <motion.button
              key={i}
              layout
              onClick={() => setActiveIndex(i)}
              className={`h-[6px] rounded-full cursor-pointer transition-colors duration-300 ${
                i === activeIndex ? 'bg-[#0A0A0A] w-5' : 'bg-gray-300 w-[6px]'
              }`}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              aria-label={`Ir para valor ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))}
          disabled={activeIndex === VALUES.length - 1}
          aria-label="Próximo"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

    </section>
  )
}
```

- [ ] **Step 2: Verify the dev server compiles without TypeScript errors**

Run: `npm run dev`
Expected: No compilation errors in the terminal. (Component not mounted yet.)

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ValuesSection.tsx
git commit -m "feat: add ValuesSection carousel with mixed-width cards"
```

---

## Task 3: Wire `ValuesSection` into the page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add import**

In `src/app/page.tsx`, add this import after line 7 (after `AutonomiaSectionV2` import):

```tsx
import ValuesSection from '@/components/sections/ValuesSection'
```

- [ ] **Step 2: Insert component between `<AutonomiaSectionV2 />` and `<Configurator />`**

Current lines 19–20:
```tsx
      <AutonomiaSectionV2 />
      <Configurator />
```

Replace with:
```tsx
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurator />
```

- [ ] **Step 3: Verify in browser**

Open: `http://localhost:3000`
Scroll to the Values section (between Autonomia and Configurador).

Check:
- Title block visible: label "Values", title "Designed to make a difference.", tagline
- First card (landscape 16:9) is visible and left-aligned to the content container
- Three portrait cards peek from the right
- Dragging left/right animates the carousel with spring physics
- Wheel scroll advances/retreats cards
- Pagination dots update correctly
- Prev/next buttons work and disable at boundaries

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire ValuesSection into page between Autonomia and Configurador"
```

---

## Done

All three tasks complete. The Values section is live between AutonomiaSectionV2 and Configurator with:
- Centered title block matching Autonomia typography
- Mixed-width horizontal carousel (16:9 + 3×9:16, same height)
- Text below images (no overlay)
- Full pointer drag, wheel scroll, and pagination interaction
