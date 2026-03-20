# Autonomia Section V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `RangeSavings` section with a full-screen scroll-driven section that pins a background image while the copy travels upward and reveals battery stats at the bottom.

**Architecture:** A 300vh outer wrapper gives scroll distance; a `position: sticky` inner shell keeps the visual locked to the viewport. Framer Motion `useScroll` + `useTransform` maps scroll progress to copy `translateY` and stats `opacity`. Stats stagger in left-to-right via Framer Motion variants.

**Tech Stack:** Next.js 15 (`'use client'`), Framer Motion (`useScroll`, `useTransform`, `useMotionValueEvent`, `motion`), Tailwind CSS, `next/image`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/sections/AutonomiaSectionV2.tsx` | Full component: scroll shell, background, copy block, stats panel |
| Modify | `src/app/page.tsx` | Hide `RangeSavings`, import and render `AutonomiaSectionV2` |

---

## Task 1: Hide RangeSavings in page.tsx

**Files:**
- Modify: `src/app/page.tsx`

This is a two-line change. We wrap `<RangeSavings />` in `{false && ...}` to hide it without deleting it or its import.

- [ ] **Step 1: Edit page.tsx**

In `src/app/page.tsx`, change:
```tsx
<RangeSavings />
```
to:
```tsx
{false && <RangeSavings />}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `npm run dev`
Expected: No TypeScript or compilation errors. The autonomia section disappears from the page.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: hide RangeSavings in preparation for autonomia v2"
```

---

## Task 2: Create AutonomiaSectionV2 — static shell with background

**Files:**
- Create: `src/components/sections/AutonomiaSectionV2.tsx`

Build the static structural skeleton first: the 300vh outer wrapper, the sticky inner shell, the background image, and the gradient overlay. No animation yet.

- [ ] **Step 1: Create the component file**

Create `src/components/sections/AutonomiaSectionV2.tsx`:

```tsx
'use client'
import Image from 'next/image'

export default function AutonomiaSectionV2() {
  return (
    <section id="autonomia" style={{ height: '300vh' }}>
      {/* Sticky shell — pins to viewport while outer section scrolls */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg"
            alt="Nissan Leaf autonomia"
            fill
            className="object-cover"
            priority={false}
          />
          {/* Overlay — matches ClosingSection */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Import and render in page.tsx**

In `src/app/page.tsx`, add the import:
```tsx
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
```

And render it directly below the hidden `RangeSavings`:
```tsx
{false && <RangeSavings />}
<AutonomiaSectionV2 />
```

- [ ] **Step 3: Verify visually**

Open the dev server. Scroll to the autonomia area. You should see:
- A full-screen dark-tinted image of the Leaf
- The section is 300vh tall (the sticky shell stays pinned as you scroll through it)
- No content yet — just background

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx src/app/page.tsx
git commit -m "feat: autonomia v2 — static sticky shell with background image"
```

---

## Task 3: Add copy block (static, centered)

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx`

Add the label + title copy block, absolutely positioned and centered. No animation yet — just verify it looks right statically.

- [ ] **Step 1: Add copy block inside the sticky shell**

Inside the sticky `<div>`, after the background div, add:

```tsx
{/* Copy block — will be animated in Task 4 */}
<div
  className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6"
  style={{ top: '40vh' }}
>
  <p
    className="font-normal mb-3"
    style={{ fontSize: '24px', color: '#86868b' }}
  >
    Autonomia
  </p>
  <h2
    className="font-semibold text-white"
    style={{
      fontSize: '80px',
      lineHeight: 1.07,
      letterSpacing: '-0.005em',
    }}
  >
    Uma bateria que vai onde tu vais.
  </h2>
</div>
```

- [ ] **Step 2: Verify visually**

The label and title should appear centered on the image, roughly in the middle of the viewport. Check:
- Label "Autonomia" in grey (`#86868b`), 24px
- Title in white, large and commanding, 80px
- Both centered horizontally

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx
git commit -m "feat: autonomia v2 — static copy block (label + title)"
```

---

## Task 4: Wire scroll animation to copy block

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx`

Add `useRef`, `useScroll`, `useTransform` from Framer Motion to animate the copy block's vertical position as the user scrolls. The copy starts at `40vh` (center) and travels to `5vh` (near top) by the 50% scroll point.

- [ ] **Step 1: Add scroll hooks to the component**

Update the file:

```tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

export default function AutonomiaSectionV2() {
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Copy travels from 40vh (center) to 5vh (near top) over first 50% of scroll
  const copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])

  return (
    <section id="autonomia" ref={containerRef} style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg"
            alt="Nissan Leaf autonomia"
            fill
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

        {/* Copy block — scroll-driven */}
        <motion.div
          className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6"
          style={{ top: copyY }}
        >
          <p
            className="font-normal mb-3"
            style={{ fontSize: '24px', color: '#86868b' }}
          >
            Autonomia
          </p>
          <h2
            className="font-semibold text-white"
            style={{
              fontSize: '80px',
              lineHeight: 1.07,
              letterSpacing: '-0.005em',
            }}
          >
            Uma bateria que vai onde tu vais.
          </h2>
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify scroll animation**

Scroll slowly through the autonomia section. You should see:
- Copy starts roughly at the vertical center of the screen
- As you scroll down, the copy smoothly travels upward
- By the halfway point of the 300vh section, copy has settled near the top (~5vh from top edge)
- After the halfway point, copy stays at the top as you continue scrolling

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx
git commit -m "feat: autonomia v2 — scroll-driven copy travel animation"
```

---

## Task 5: Add stats panel (static, positioned at bottom)

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx`

Add the four-column stats panel at the bottom of the sticky shell. Static for now — verify layout before wiring animation.

- [ ] **Step 1: Define stats data constant at the top of the file**

Add above the component function:

```tsx
const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',      descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',     descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh',  descriptor: 'Eficiência energética' },
]
```

- [ ] **Step 2: Add stats panel inside the sticky shell**

After the copy block `motion.div`, add:

```tsx
{/* Stats panel — will be animated in Task 6 */}
<div className="absolute bottom-12 inset-x-0 z-10 px-16">
  <div className="grid grid-cols-4 gap-8">
    {STATS.map((stat) => (
      <div key={stat.descriptor} className="flex flex-col">
        {/* Qualifier */}
        {stat.qualifier ? (
          <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>
            {stat.qualifier}
          </p>
        ) : (
          <p style={{ fontSize: '21px', color: 'transparent', fontWeight: 400 }}>
            &nbsp;
          </p>
        )}
        {/* Number + Unit */}
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontSize: '48px',
              fontWeight: 500,
              color: 'white',
              letterSpacing: '-0.003em',
            }}
          >
            {stat.number}
          </span>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 500,
              color: 'white',
              letterSpacing: '-0.003em',
            }}
          >
            {stat.unit}
          </span>
        </div>
        {/* Descriptor */}
        <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>
          {stat.descriptor}
        </p>
      </div>
    ))}
  </div>
</div>
```

Note: The empty qualifier uses a transparent spacer so all columns align their number rows consistently regardless of whether they have a qualifier.

- [ ] **Step 3: Verify layout**

Check:
- Four columns evenly spaced across the full width
- Each column: grey qualifier (or blank spacer) → white number + unit → grey descriptor
- All number rows horizontally aligned across columns
- Panel sits at `bottom-12` over the background image

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx
git commit -m "feat: autonomia v2 — static stats panel, four columns"
```

---

## Task 6: Animate stats reveal with scroll + stagger

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx`

Wire `statsOpacity` transform and the stagger variants. Use `useMotionValueEvent` to trigger the stagger animation imperatively when opacity crosses 0.05.

- [ ] **Step 1: Add useState, useMotionValueEvent, and variants**

Add `useState` to imports. Add `useMotionValueEvent` to the framer-motion import. Then add inside the component, after `copyY`:

```tsx
const [statsVisible, setStatsVisible] = useState(false)

// Stats fade in from 45% to 65% of scroll progress
const statsOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])

// Trigger stagger when opacity first crosses 0.05
useMotionValueEvent(statsOpacity, 'change', (v) => {
  if (v > 0.05) setStatsVisible(true)
})
```

Add variants above the component (alongside `STATS`):

```tsx
const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}
```

- [ ] **Step 2: Convert stats panel to motion elements**

Replace the static stats panel `<div>` wrapper and inner divs with motion equivalents:

```tsx
{/* Stats panel */}
<motion.div
  className="absolute bottom-12 inset-x-0 z-10 px-16"
  style={{ opacity: statsOpacity }}
>
  <motion.div
    className="grid grid-cols-4 gap-8"
    variants={statsContainerVariants}
    initial="hidden"
    animate={statsVisible ? 'visible' : 'hidden'}
  >
    {STATS.map((stat) => (
      <motion.div key={stat.descriptor} className="flex flex-col" variants={statItemVariants}>
        {/* Qualifier */}
        {stat.qualifier ? (
          <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>
            {stat.qualifier}
          </p>
        ) : (
          <p style={{ fontSize: '21px', color: 'transparent', fontWeight: 400 }}>
            &nbsp;
          </p>
        )}
        {/* Number + Unit */}
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontSize: '48px',
              fontWeight: 500,
              color: 'white',
              letterSpacing: '-0.003em',
            }}
          >
            {stat.number}
          </span>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 500,
              color: 'white',
              letterSpacing: '-0.003em',
            }}
          >
            {stat.unit}
          </span>
        </div>
        {/* Descriptor */}
        <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>
          {stat.descriptor}
        </p>
      </motion.div>
    ))}
  </motion.div>
</motion.div>
```

- [ ] **Step 3: Verify full animation sequence**

Scroll through the section from top to bottom and check:
1. Copy starts centered, travels upward as you scroll
2. Copy settles near the top at ~50% scroll
3. Stats are invisible when copy is traveling
4. At ~45-65% scroll, stats panel fades in
5. Each stat column staggers in left to right with a slight upward slide
6. At 100% scroll, both copy and stats are fully visible

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx
git commit -m "feat: autonomia v2 — scroll-driven stats reveal with stagger animation"
```

---

## Final State

The complete `AutonomiaSectionV2.tsx` at end of all tasks:

```tsx
'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'

const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',      descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',     descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh',  descriptor: 'Eficiência energética' },
]

const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export default function AutonomiaSectionV2() {
  const containerRef = useRef<HTMLElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])
  const statsOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])

  useMotionValueEvent(statsOpacity, 'change', (v) => {
    if (v > 0.05) setStatsVisible(true)
  })

  return (
    <section id="autonomia" ref={containerRef} style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg"
            alt="Nissan Leaf autonomia"
            fill
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

        {/* Copy block */}
        <motion.div
          className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6"
          style={{ top: copyY }}
        >
          <p className="font-normal mb-3" style={{ fontSize: '24px', color: '#86868b' }}>
            Autonomia
          </p>
          <h2
            className="font-semibold text-white"
            style={{ fontSize: '80px', lineHeight: 1.07, letterSpacing: '-0.005em' }}
          >
            Uma bateria que vai onde tu vais.
          </h2>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          className="absolute bottom-12 inset-x-0 z-10 px-16"
          style={{ opacity: statsOpacity }}
        >
          <motion.div
            className="grid grid-cols-4 gap-8"
            variants={statsContainerVariants}
            initial="hidden"
            animate={statsVisible ? 'visible' : 'hidden'}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.descriptor} className="flex flex-col" variants={statItemVariants}>
                {stat.qualifier ? (
                  <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>{stat.qualifier}</p>
                ) : (
                  <p style={{ fontSize: '21px', color: 'transparent', fontWeight: 400 }}>&nbsp;</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span style={{ fontSize: '48px', fontWeight: 500, color: 'white', letterSpacing: '-0.003em' }}>
                    {stat.number}
                  </span>
                  <span style={{ fontSize: '48px', fontWeight: 500, color: 'white', letterSpacing: '-0.003em' }}>
                    {stat.unit}
                  </span>
                </div>
                <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>{stat.descriptor}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
```
