# Highlights Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Highlights section into a white-background Apple-style center-focus carousel with Space Grotesk as the global heading font.

**Architecture:** Three focused changes in sequence — (1) typography system update touching `layout.tsx` and `globals.css`, (2) `HighlightCard` component rewrite with new props/layout, (3) `Highlights` section rewrite with Framer Motion drag carousel and pagination dots.

**Tech Stack:** Next.js (app router), Tailwind CSS v4, Framer Motion (already installed), `next/font/google` for Space Grotesk

**Spec:** `docs/superpowers/specs/2026-03-19-highlights-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/layout.tsx` | Modify | Add Space Grotesk font, expose `--font-space-grotesk` CSS variable on `<html>` |
| `src/app/globals.css` | Modify | Add `--font-family-heading` token, update `h1–h4` base rule to use `font-heading font-bold` |
| `src/components/ui/HighlightCard.tsx` | Rewrite | Stateless card: image (65%) + content (35%), `isActive` controls overlay |
| `src/components/sections/Highlights.tsx` | Rewrite | Section shell, title, Framer Motion drag carousel, pagination dots |

---

## Task 1: Add Space Grotesk font and update global heading typography

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1.1: Add Space Grotesk to layout.tsx**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import CookieBanner from '@/components/CookieBanner'

const cormorant = Cormorant_Garamond({
  weight: ['300'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${cormorant.variable} ${spaceGrotesk.variable}`}>
      <body className={GeistSans.className}>
        <Navbar />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

- [ ] **Step 1.2: Update globals.css with heading font token and base rule**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-background: #0A0A0A;
  --color-surface: #111111;
  --color-card: #1A1A1A;
  --color-accent: #0070C9;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A1A1A1;

  --font-family-sans: var(--font-geist-sans), Inter, system-ui, sans-serif;
  --font-family-cormorant: var(--font-cormorant), Georgia, serif;
  --font-family-heading: var(--font-space-grotesk), system-ui, sans-serif;

  --animate-fade-up: fadeUp 0.6s ease-out forwards;
  --animate-count-up: countUp 1s ease-out forwards;

  --keyframes-fadeUp-0%: { opacity: 0; transform: translateY(20px); };
  --keyframes-fadeUp-100%: { opacity: 1; transform: translateY(0); };
}

@layer base {
  body {
    @apply bg-background text-text-primary antialiased;
  }

  h1, h2, h3, h4 {
    @apply font-heading font-bold tracking-tight;
  }
}
```

- [ ] **Step 1.3: Verify build compiles cleanly**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors. Space Grotesk will be fetched from Google Fonts at build time.

- [ ] **Step 1.4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add Space Grotesk as global heading font"
```

---

## Task 2: Rewrite HighlightCard component

**Files:**
- Rewrite: `src/components/ui/HighlightCard.tsx`

The card is stateless. It receives `isActive` from the parent carousel and uses it only to show/hide the inactive overlay. All scale/opacity animation happens in the parent.

- [ ] **Step 2.1: Rewrite HighlightCard.tsx**

Replace the full file contents of `src/components/ui/HighlightCard.tsx` with:

```tsx
import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  category: string
  label: string
  description: string
  isActive: boolean
}

export default function HighlightCard({
  imageSrc,
  imageAlt,
  category,
  label,
  description,
  isActive,
}: HighlightCardProps) {
  return (
    <div className="w-[75vw] md:w-[60vw] aspect-[4/5] flex flex-col rounded-2xl overflow-hidden shadow-xl bg-white relative">
      {/* Image — 65% of card height */}
      <div className="relative shrink-0" style={{ flex: '0 0 65%' }}>
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>

      {/* Content — remaining 35% */}
      <div className="flex-1 p-8 flex flex-col justify-center">
        <p className="font-heading font-medium text-xs tracking-widest uppercase text-gray-400 mb-2">
          {category}
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {label}
        </h3>
        <p className="text-base text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Inactive overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-white/20 transition-opacity duration-300" />
      )}
    </div>
  )
}
```

- [ ] **Step 2.2: Verify build compiles cleanly**

```bash
npm run build
```

Expected: exits 0. The old `Highlights.tsx` still references `HighlightCard` with the old props — expect a TypeScript error there. That's fine; it will be fixed in Task 3.

> If the build fails only on `Highlights.tsx` prop mismatch — that is expected. If it fails on `HighlightCard.tsx` itself, fix that first.

- [ ] **Step 2.3: Commit**

```bash
git add src/components/ui/HighlightCard.tsx
git commit -m "feat: rewrite HighlightCard with new layout and isActive prop"
```

---

## Task 3: Rewrite Highlights section with Framer Motion carousel

**Files:**
- Rewrite: `src/components/sections/Highlights.tsx`

This is the main task. The carousel uses a single `motion.div` track translated on `x` to center the active card. Card width is measured via `ResizeObserver` on the first card's DOM node.

- [ ] **Step 3.1: Rewrite Highlights.tsx**

Replace the full file contents of `src/components/sections/Highlights.tsx` with:

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import HighlightCard from '@/components/ui/HighlightCard'

const HIGHLIGHTS = [
  {
    imageSrc: '/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png',
    imageAlt: 'Design exterior do Nissan Leaf',
    category: 'DESIGN',
    label: 'Design que impressiona',
    description: 'Linhas curvas e uma silhueta moderna que redefinem o que um elétrico pode ser.',
  },
  {
    imageSrc: '/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png',
    imageAlt: 'Interior tecnológico do Nissan Leaf',
    category: 'TECNOLOGIA',
    label: 'Tecnologia no centro',
    description: 'Cockpit digital, conectividade total e sistemas de assistência à condução.',
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Autonomia do Nissan Leaf',
    category: 'AUTONOMIA',
    label: 'Vai mais longe',
    description: 'Autonomia real para o teu dia a dia, com carregamento rápido onde precisas.',
  },
  {
    imageSrc: '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
    imageAlt: 'Nissan Leaf 100% elétrico',
    category: 'ELÉTRICO',
    label: 'Zero emissões',
    description: '100% elétrico. Contribui para um futuro mais limpo a cada quilómetro.',
  },
]

const GAP = 24 // px — matches gap-6 (1.5rem at 16px base)

const trackSpring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.5 }
const cardTransition = { type: 'tween' as const, duration: 0.3, ease: 'easeInOut' }

function getScale(distance: number) {
  if (distance === 0) return 1
  if (distance === 1) return 0.92
  return 0.88
}

function getOpacity(distance: number) {
  if (distance === 0) return 1
  if (distance === 1) return 0.6
  return 0.4
}

export default function Highlights() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setViewportWidth(window.innerWidth)

    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    if (!cardRef.current) return () => window.removeEventListener('resize', handleResize)

    const ro = new ResizeObserver(() => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.getBoundingClientRect().width)
      }
    })
    ro.observe(cardRef.current)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getOffset = (index: number) =>
    viewportWidth / 2 - cardWidth / 2 - index * (cardWidth + GAP)

  const targetOffset = getOffset(activeIndex)
  const maxRight = getOffset(0)
  const maxLeft = getOffset(HIGHLIGHTS.length - 1)

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const { offset, velocity } = info
    if (Math.abs(velocity.x) > 500) {
      if (velocity.x < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else if (Math.abs(offset.x) > cardWidth / 2) {
      if (offset.x < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    }
  }

  return (
    <section id="highlights" className="pt-32 pb-32 bg-white overflow-hidden">
      {/* Title */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-24">
        <motion.h2
          className="text-6xl md:text-8xl text-[#0A0A0A]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Feito para te surpreender.
        </motion.h2>
      </div>

      {/* Carousel track */}
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex flex-row"
          style={{ gap: GAP }}
          drag="x"
          dragConstraints={{ left: maxLeft, right: maxRight }}
          dragElastic={0.1}
          animate={{ x: targetOffset }}
          transition={trackSpring}
          onDragEnd={handleDragEnd}
        >
          {HIGHLIGHTS.map((h, i) => {
            const distance = Math.abs(i - activeIndex)
            return (
              <div
                key={h.label}
                ref={i === 0 ? cardRef : undefined}
                className="shrink-0"
              >
                <motion.div
                  animate={{
                    scale: getScale(distance),
                    opacity: getOpacity(distance),
                  }}
                  transition={cardTransition}
                >
                  <HighlightCard {...h} isActive={i === activeIndex} />
                </motion.div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center items-center gap-2 mt-10">
        {HIGHLIGHTS.map((_, i) => (
          <motion.button
            key={i}
            layout
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full cursor-pointer ${
              i === activeIndex ? 'bg-gray-800 w-6' : 'bg-gray-300 w-2'
            }`}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            aria-label={`Ir para destaque ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3.2: Verify build compiles cleanly**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 3.3: Smoke test in dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Highlights section has white background (contrasts with dark Hero)
- [ ] Title renders in Space Grotesk (geometric, not serif) at large size
- [ ] All other page headings (Hero, CTAs) also use Space Grotesk
- [ ] First card is centered on load with second card peeking in from the right
- [ ] Drag left/right snaps between cards with spring animation
- [ ] Adjacent cards are visibly smaller and dimmer than the active card
- [ ] Tapping pagination dots jumps to correct card
- [ ] Active dot is a wide pill, inactive dots are small circles

- [ ] **Step 3.4: Commit**

```bash
git add src/components/sections/Highlights.tsx
git commit -m "feat: rewrite Highlights as Framer Motion center-focus carousel"
```

---

## Done

All four files changed, three commits made. The highlights section now has:
- Space Grotesk global headings
- White section with 128px top/bottom padding
- Apple-style drag carousel with scale/opacity focus effect
- Real Leaf images
- Framer Motion pagination dots
