# Nissan Leaf Pre-order Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, scroll-driven pre-order landing page for the Nissan Leaf launch in Portugal, with Stripe deposit checkout and Zoho CRM lead capture.

**Architecture:** Next.js App Router single-page application assembled from independent section components. API routes handle Stripe Checkout Session creation and Zoho CRM lead submission server-side. The vehicle configurator is toggled between a Three.js 3D viewer and a pre-rendered image sequence via an environment variable.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Three.js, Stripe, Zoho CRM API, Vercel

**Spec:** `docs/superpowers/specs/2026-03-19-nissan-leaf-presales-design.md`

---

## File Map

```
leaf-presales/
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout: fonts, metadata, cookie consent
│   │   ├── globals.css                        # Tailwind base imports
│   │   ├── page.tsx                           # Main landing page — assembles all sections
│   │   ├── obrigado/
│   │   │   └── page.tsx                      # Post-Stripe success confirmation page
│   │   └── api/
│   │       ├── checkout/
│   │       │   └── route.ts                  # POST: creates Stripe Checkout Session
│   │       └── leads/
│   │           └── route.ts                  # POST: submits lead to Zoho CRM
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx                    # Sticky nav, visible after hero exits viewport
│   │   ├── ui/
│   │   │   ├── Button.tsx                    # Primary / ghost / outline button variants
│   │   │   ├── HighlightCard.tsx             # Image/video + label + copy card
│   │   │   ├── StatCard.tsx                  # Clickable stat card (for Range & Savings)
│   │   │   └── Modal.tsx                     # Generic animated full-screen modal wrapper
│   │   ├── sections/
│   │   │   ├── Hero.tsx                      # Fullscreen hero with dual CTAs
│   │   │   ├── Highlights.tsx                # 3–4 HighlightCards in a row
│   │   │   ├── Configurator.tsx              # Section wrapper for the 360 configurator
│   │   │   ├── RangeSavings.tsx              # StatCards + modal trigger
│   │   │   ├── CTASection.tsx                # Stripe CTA left + ContactForm right
│   │   │   ├── VersionComparison.tsx         # 3-column comparison table
│   │   │   └── ClosingSection.tsx            # Fullscreen image + CTAs + footer bar
│   │   ├── configurator/
│   │   │   ├── ConfiguratorViewer.tsx        # Reads NEXT_PUBLIC_CONFIGURATOR_MODE, renders correct viewer
│   │   │   ├── ImageSequenceViewer.tsx       # Drag/swipe-to-rotate from image set
│   │   │   ├── ThreeDViewer.tsx              # Three.js GLB viewer
│   │   │   └── ColorSwitcher.tsx             # Circular swatch row
│   │   └── forms/
│   │       ├── ContactForm.tsx               # First name, last name, email, phone, preferred time
│   │       └── SavingsCalculator.tsx         # Interactive savings calculator (modal content)
│   ├── lib/
│   │   ├── stripe.ts                         # Stripe server-side client init
│   │   ├── zoho.ts                           # Zoho OAuth token refresh + lead POST helper
│   │   └── savings.ts                        # Pure savings calculation logic (testable)
│   └── types/
│       └── index.ts                          # Shared TypeScript types
├── public/
│   ├── images/                               # Nissan campaign images (placeholders initially)
│   │   └── placeholder-hero.jpg
│   └── videos/                               # AI micro-videos (placeholders initially)
│       └── placeholder-hero.mp4
├── tests/
│   ├── lib/
│   │   └── savings.test.ts                   # Unit tests for savings calculation logic
│   └── api/
│       ├── checkout.test.ts                  # Unit tests for Stripe API route
│       └── leads.test.ts                     # Unit tests for Zoho leads API route
├── .env.local.example                        # Environment variable template
└── jest.config.ts                            # Jest configuration
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (via Next.js CLI)
- Create: `tailwind.config.ts`
- Create: `jest.config.ts`
- Create: `.env.local.example`
- Create: `src/app/globals.css`
- Create: `src/types/index.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /Users/brunombteixeira/Documents/07.\ Innovation\ \&\ AI/01.\ Iniciatives/leaf-presales
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Accept all defaults. When prompted for the project name, use `.` (current directory).

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion three @types/three stripe @stripe/stripe-js
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

- [ ] **Step 3: Configure Jest**

Create `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create environment variable template**

Create `.env.local.example`:
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Zoho CRM
ZOHO_CLIENT_ID=...
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...

# Configurator mode: "3d" or "image-sequence"
NEXT_PUBLIC_CONFIGURATOR_MODE=image-sequence
```

Copy it: `cp .env.local.example .env.local` and fill in real values.

- [ ] **Step 5: Define shared types**

Create `src/types/index.ts`:
```typescript
export type ButtonVariant = 'primary' | 'ghost' | 'outline'

export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
}

export interface SavingsInputs {
  monthlyFuelSpend: number   // €/month
  monthlyKm: number          // km/month
  electricityTariff: number  // €/kWh
}

export interface SavingsResult {
  monthlySavings: number
  annualSavings: number
  co2AvoidedKgPerYear: number
}

export type ConfiguratorMode = '3d' | 'image-sequence'

export type ConfiguratorView = 'exterior' | 'interior'

export interface VehicleVersion {
  id: string
  name: string
  price: number           // starting price in €
  isPopular?: boolean
  features: Record<string, boolean | string>
}

export interface StatCardData {
  id: string
  stat: string
  unit: string
  descriptor: string
  modalContent: React.ReactNode
}
```

- [ ] **Step 6: Add placeholder assets**

```bash
mkdir -p public/images public/videos
# Add a dark placeholder image and video (can be 1x1 pixel initially)
curl -o public/images/placeholder-hero.jpg https://via.placeholder.com/1920x1080/0A0A0A/0A0A0A
```

Or simply create an empty placeholder file — any dark image will do for scaffolding.

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server starts at `http://localhost:3000` with no errors.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Tailwind, Framer Motion, Three.js, Stripe"
```

---

## Task 2: Tailwind Design System + Button Component

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Extend Tailwind config with design tokens**

Replace `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#111111',
        card: '#1A1A1A',
        accent: '#0070C9',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A1',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css**

Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text-primary antialiased;
  }

  h1, h2, h3, h4 {
    @apply font-sans font-semibold tracking-tight;
  }
}
```

- [ ] **Step 3: Build the Button component**

Create `src/components/ui/Button.tsx`:
```tsx
'use client'
import { forwardRef } from 'react'
import type { ButtonVariant } from '@/types'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-blue-600 border border-accent',
  ghost: 'bg-transparent text-white border border-white/30 hover:border-white',
  outline: 'bg-transparent text-accent border border-accent hover:bg-accent hover:text-white',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center px-8 py-3
        text-sm font-medium tracking-wide rounded-full
        transition-all duration-200 cursor-pointer
        ${variantClasses[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
export default Button
```

- [ ] **Step 4: Verify the component renders**

Add a temporary Button import to `src/app/page.tsx` and run `npm run dev` to confirm no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx tailwind.config.ts src/app/globals.css
git commit -m "feat: add Tailwind design tokens and Button component"
```

---

## Task 3: Navbar

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Build Navbar**

Create `src/components/layout/Navbar.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

const SECTIONS = [
  { label: 'Destaques', href: '#highlights' },
  { label: 'Configurador', href: '#configurador' },
  { label: 'Autonomia', href: '#autonomia' },
  { label: 'Versões', href: '#versoes' },
]

export default function Navbar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/80 backdrop-blur-md border-b border-white/5"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-text-primary">
            Nissan Leaf
          </span>
          <ul className="hidden md:flex gap-8">
            {SECTIONS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            onClick={() => document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs px-5 py-2"
          >
            Reservar
          </Button>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Add Navbar to root layout**

Modify `src/app/layout.tsx` to include `<Navbar />` before `{children}`:
```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={GeistSans.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
```

Note: Install Geist font if not already available: `npm install geist`

- [ ] **Step 3: Verify scroll behavior**

Run `npm run dev`, open `http://localhost:3000`, scroll down — navbar should appear after the first viewport height. Scroll back up — it should disappear.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/app/layout.tsx
git commit -m "feat: add sticky navbar with scroll-triggered visibility"
```

---

## Task 4: Hero Section

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build Hero component**

Create `src/components/sections/Hero.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function Hero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background video / image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/placeholder-hero.jpg"
        >
          <source src="/videos/placeholder-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4"
        >
          O futuro chegou.
          <br />
          Reserve o seu.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg text-text-secondary mb-10"
        >
          O novo Nissan Leaf. 100% elétrico. Design que redefine o futuro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Ser contactado
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="w-px h-10 bg-white/30 mx-auto" />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Wire Hero into page.tsx**

Replace `src/app/page.tsx`:
```tsx
import Hero from '@/components/sections/Hero'

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Remaining sections added in subsequent tasks */}
    </main>
  )
}
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Hero should be fullscreen with overlay, headline animates in on load, two CTA buttons visible, scroll indicator pulses.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/page.tsx
git commit -m "feat: add fullscreen Hero section with dual CTAs and scroll indicator"
```

---

## Task 5: Highlights Section

**Files:**
- Create: `src/components/ui/HighlightCard.tsx`
- Create: `src/components/sections/Highlights.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build HighlightCard**

Create `src/components/ui/HighlightCard.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  label: string
  description: string
  videoSrc?: string
}

export default function HighlightCard({
  imageSrc, imageAlt, label, description, videoSrc,
}: HighlightCardProps) {
  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="relative aspect-[4/3] w-full">
        {videoSrc ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        )}
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build Highlights section**

Create `src/components/sections/Highlights.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import HighlightCard from '@/components/ui/HighlightCard'

const HIGHLIGHTS = [
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Design exterior do Nissan Leaf',
    label: 'Design que impressiona',
    description: 'Linhas curvas e uma silhueta moderna que redefinem o que um elétrico pode ser.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Interior tecnológico do Nissan Leaf',
    label: 'Tecnologia no centro',
    description: 'Cockpit digital, conectividade total e sistemas de assistência à condução.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Autonomia do Nissan Leaf',
    label: 'Vai mais longe',
    description: 'Autonomia real para o teu dia a dia, com carregamento rápido onde precisas.',
  },
  {
    imageSrc: '/images/placeholder-hero.jpg',
    imageAlt: 'Zero emissões Nissan Leaf',
    label: 'Zero emissões',
    description: '100% elétrico. Contribui para um futuro mais limpo a cada quilómetro.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Highlights() {
  return (
    <section id="highlights" className="py-24 px-6 md:px-12 bg-surface">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Feito para te surpreender.
      </motion.h2>

      {/* Desktop: row */}
      <motion.div
        className="hidden md:flex gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {HIGHLIGHTS.map((h) => (
          <motion.div key={h.label} variants={item} className="flex-1 min-w-0">
            <HighlightCard {...h} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {HIGHLIGHTS.map((h) => (
          <div key={h.label} className="snap-start shrink-0 w-72">
            <HighlightCard {...h} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add to page.tsx**

```tsx
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
    </main>
  )
}
```

- [ ] **Step 4: Verify**

Run `npm run dev`. Scroll past hero — Highlights section should appear with staggered card animation. On narrow viewport, cards should be a horizontal scroll carousel.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/HighlightCard.tsx src/components/sections/Highlights.tsx src/app/page.tsx
git commit -m "feat: add Highlights section with responsive card grid and scroll animations"
```

---

## Task 6: Modal + StatCard UI Components

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/StatCard.tsx`

These are shared UI primitives used by the Range & Savings section. Build them before the section.

- [ ] **Step 1: Build Modal**

Create `src/components/ui/Modal.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-2xl mx-4 bg-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Build StatCard**

Create `src/components/ui/StatCard.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'

interface StatCardProps {
  stat: string
  unit: string
  descriptor: string
  cta?: string
  onClick?: () => void
}

export default function StatCard({ stat, unit, descriptor, cta = 'Saber mais', onClick }: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex-1 min-w-0 bg-card rounded-xl p-6 text-left group cursor-pointer hover:bg-white/5 transition-colors"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3">
        <span className="text-5xl font-bold text-white">{stat}</span>
        <span className="text-xl text-text-secondary ml-1">{unit}</span>
      </div>
      <p className="text-sm text-text-secondary mb-4">{descriptor}</p>
      <span className="text-xs text-accent group-hover:underline">{cta} →</span>
    </motion.button>
  )
}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/StatCard.tsx
git commit -m "feat: add Modal and StatCard UI components"
```

---

## Task 7: Savings Calculator Logic (TDD) + Component

**Files:**
- Create: `src/lib/savings.ts`
- Create: `tests/lib/savings.test.ts`
- Create: `src/components/forms/SavingsCalculator.tsx`

- [ ] **Step 1: Write failing tests for savings logic**

Create `tests/lib/savings.test.ts`:
```typescript
import { calculateSavings } from '@/lib/savings'

describe('calculateSavings', () => {
  it('returns zero savings when no fuel spend', () => {
    const result = calculateSavings({ monthlyFuelSpend: 0, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.monthlySavings).toBe(0)
    expect(result.annualSavings).toBe(0)
  })

  it('calculates monthly savings correctly', () => {
    // 150 €/month fuel, 1000 km, Leaf uses ~15 kWh/100km, tariff 0.22
    // Electricity cost = (1000/100) * 15 * 0.22 = 33 €
    // Savings = 150 - 33 = 117 €
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.monthlySavings).toBeCloseTo(117, 0)
  })

  it('calculates annual savings as 12x monthly', () => {
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.annualSavings).toBeCloseTo(result.monthlySavings * 12, 0)
  })

  it('calculates CO2 avoided', () => {
    // 1000 km/month * 12 = 12000 km/year
    // Average combustion car: 120g CO2/km = 1440 kg CO2/year
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.co2AvoidedKgPerYear).toBeCloseTo(1440, 0)
  })

  it('clamps savings to 0 when electricity is more expensive than fuel', () => {
    const result = calculateSavings({ monthlyFuelSpend: 10, monthlyKm: 5000, electricityTariff: 0.50 })
    expect(result.monthlySavings).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest tests/lib/savings.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/savings'`

- [ ] **Step 3: Implement savings logic**

Create `src/lib/savings.ts`:
```typescript
import type { SavingsInputs, SavingsResult } from '@/types'

const LEAF_KWH_PER_100KM = 15       // Nissan Leaf average consumption
const CO2_G_PER_KM_COMBUSTION = 120 // Average petrol car

export function calculateSavings(inputs: SavingsInputs): SavingsResult {
  const { monthlyFuelSpend, monthlyKm, electricityTariff } = inputs

  const monthlyElectricityCost = (monthlyKm / 100) * LEAF_KWH_PER_100KM * electricityTariff
  const monthlySavings = Math.max(0, monthlyFuelSpend - monthlyElectricityCost)
  const annualSavings = monthlySavings * 12
  const co2AvoidedKgPerYear = (monthlyKm * 12 * CO2_G_PER_KM_COMBUSTION) / 1000

  return { monthlySavings, annualSavings, co2AvoidedKgPerYear }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest tests/lib/savings.test.ts --no-coverage
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Build SavingsCalculator component**

Create `src/components/forms/SavingsCalculator.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { calculateSavings } from '@/lib/savings'

const DEFAULT_INPUTS = {
  monthlyFuelSpend: 150,
  monthlyKm: 1000,
  electricityTariff: 0.22,
}

export default function SavingsCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)
  const results = calculateSavings(inputs)

  const set = (key: keyof typeof inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) }))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">Calcula a tua poupança</h3>
        <p className="text-sm text-text-secondary">
          Compara o custo de conduzir um carro a combustão com o novo Leaf elétrico.
        </p>
      </div>

      <div className="space-y-5">
        <Slider
          label="Gasto mensal em combustível"
          value={inputs.monthlyFuelSpend}
          min={20} max={400} step={10}
          unit="€/mês"
          onChange={set('monthlyFuelSpend')}
        />
        <Slider
          label="Quilómetros por mês"
          value={inputs.monthlyKm}
          min={200} max={5000} step={100}
          unit="km"
          onChange={set('monthlyKm')}
        />
        <Slider
          label="Tarifa de eletricidade"
          value={inputs.electricityTariff}
          min={0.10} max={0.40} step={0.01}
          unit="€/kWh"
          onChange={set('electricityTariff')}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <Result label="Poupança mensal" value={`€${Math.round(results.monthlySavings)}`} />
        <Result label="Poupança anual" value={`€${Math.round(results.annualSavings)}`} />
        <Result label="CO₂ evitado/ano" value={`${Math.round(results.co2AvoidedKgPerYear)} kg`} />
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} onChange={onChange}
        className="w-full accent-accent"
      />
    </div>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-accent">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/savings.ts tests/lib/savings.test.ts src/components/forms/SavingsCalculator.tsx
git commit -m "feat: add savings calculator logic (TDD) and SavingsCalculator component"
```

---

## Task 8: Range & Savings Section

**Files:**
- Create: `src/components/sections/RangeSavings.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build RangeSavings section**

Create `src/components/sections/RangeSavings.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SavingsCalculator from '@/components/forms/SavingsCalculator'

const STAT_CARDS = [
  {
    id: 'autonomia',
    stat: '450',
    unit: 'km',
    descriptor: 'Autonomia máxima em ciclo misto WLTP',
    modalTitle: 'Autonomia real',
    modalContent: 'O novo Nissan Leaf oferece até 450 km de autonomia em ciclo misto WLTP, suficiente para os teus trajetos diários e muito mais.',
  },
  {
    id: 'carregamento',
    stat: '40',
    unit: 'min',
    descriptor: 'De 0 a 80% em carregamento rápido',
    modalTitle: 'Carregamento rápido',
    modalContent: 'Com carregamento rápido CHAdeMO de 50 kW, passa de 0 a 80% em apenas 40 minutos. Em casa, uma noite de carga normal é suficiente.',
  },
  {
    id: 'poupanca',
    stat: '€120',
    unit: '/mês',
    descriptor: 'Poupança média vs. carro a combustão',
    modalTitle: 'A tua poupança',
    modalContent: null, // SavingsCalculator rendered here
  },
  {
    id: 'emissoes',
    stat: '0',
    unit: 'g CO₂/km',
    descriptor: 'Emissões diretas durante a condução',
    modalTitle: 'Impacto ambiental',
    modalContent: 'Condução 100% elétrica significa zero emissões diretas. Em Portugal, com o mix energético atual, o Leaf emite cerca de 40% menos CO₂ do que um equivalente a gasolina ao longo do seu ciclo de vida.',
  },
]

export default function RangeSavings() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const active = STAT_CARDS.find((c) => c.id === activeModal)

  return (
    <section id="autonomia" className="py-24 px-6 md:px-12 bg-background">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Vai mais longe. Carrega mais rápido.
      </motion.h2>

      {/* Desktop */}
      <motion.div
        className="hidden md:flex gap-5"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.id}
            stat={card.stat}
            unit={card.unit}
            descriptor={card.descriptor}
            onClick={() => setActiveModal(card.id)}
          />
        ))}
      </motion.div>

      {/* Mobile carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {STAT_CARDS.map((card) => (
          <div key={card.id} className="snap-start shrink-0 w-64">
            <StatCard
              stat={card.stat}
              unit={card.unit}
              descriptor={card.descriptor}
              onClick={() => setActiveModal(card.id)}
            />
          </div>
        ))}
      </div>

      <Modal open={activeModal !== null} onClose={() => setActiveModal(null)}>
        {active && (
          <div>
            <h3 className="text-2xl font-bold mb-4">{active.modalTitle}</h3>
            {active.id === 'poupanca' ? (
              <SavingsCalculator />
            ) : (
              <p className="text-text-secondary leading-relaxed">{active.modalContent}</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

```tsx
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import RangeSavings from '@/components/sections/RangeSavings'

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
      <RangeSavings />
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Stat cards should animate in on scroll. Clicking any card opens the modal. Clicking the Poupança card shows the savings calculator with live-updating results.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/RangeSavings.tsx src/app/page.tsx
git commit -m "feat: add Range & Savings section with stat cards and modal calculator"
```

---

## Task 9: Configurator — Image Sequence Viewer

**Files:**
- Create: `src/components/configurator/ColorSwitcher.tsx`
- Create: `src/components/configurator/ImageSequenceViewer.tsx`
- Create: `src/components/configurator/ThreeDViewer.tsx` (stub)
- Create: `src/components/configurator/ConfiguratorViewer.tsx`
- Create: `src/components/sections/Configurator.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build ColorSwitcher**

Create `src/components/configurator/ColorSwitcher.tsx`:
```tsx
'use client'

interface Color {
  id: string
  label: string
  hex: string
}

interface ColorSwitcherProps {
  colors: Color[]
  activeColor: string
  onSelect: (id: string) => void
}

export default function ColorSwitcher({ colors, activeColor, onSelect }: ColorSwitcherProps) {
  return (
    <div className="flex gap-3 justify-center mt-6">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          title={color.label}
          className={`
            w-8 h-8 rounded-full transition-all duration-200 border-2
            ${activeColor === color.id ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}
          `}
          style={{ backgroundColor: color.hex }}
          aria-label={color.label}
          aria-pressed={activeColor === color.id}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Build ImageSequenceViewer**

Create `src/components/configurator/ImageSequenceViewer.tsx`:
```tsx
'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { ConfiguratorView } from '@/types'

interface ImageSequenceViewerProps {
  view: ConfiguratorView
  colorId: string
  // Image sets: images[view][colorId] = array of frame URLs
  images: Record<ConfiguratorView, Record<string, string[]>>
}

export default function ImageSequenceViewer({ view, colorId, images }: ImageSequenceViewerProps) {
  const frames = images[view][colorId] ?? []
  const frameCount = frames.length || 1

  const [frameIndex, setFrameIndex] = useState(0)
  const dragStart = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const delta = e.clientX - dragStart.current
    if (Math.abs(delta) > 10) {
      const direction = delta > 0 ? -1 : 1
      setFrameIndex((i) => (i + direction + frameCount) % frameCount)
      dragStart.current = e.clientX
    }
  }, [frameCount])

  const handlePointerUp = useCallback(() => {
    dragStart.current = null
  }, [])

  const currentSrc = frames[frameIndex] ?? '/images/placeholder-hero.jpg'

  return (
    <div
      className="relative w-full aspect-video select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Image
        src={currentSrc}
        alt="Vista do veículo"
        fill
        className="object-contain"
        draggable={false}
        priority
      />
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/30">
        Arrasta para rodar
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create Three.js viewer stub**

Create `src/components/configurator/ThreeDViewer.tsx`:
```tsx
'use client'
// Three.js GLB viewer — implemented when .glb asset is available
// Toggle via NEXT_PUBLIC_CONFIGURATOR_MODE=3d
import type { ConfiguratorView } from '@/types'

interface ThreeDViewerProps {
  view: ConfiguratorView
  colorId: string
}

export default function ThreeDViewer({ view, colorId }: ThreeDViewerProps) {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-card rounded-xl">
      <p className="text-text-secondary text-sm">
        3D viewer — aguarda asset .glb do importador
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Build ConfiguratorViewer (env-flag router)**

Create `src/components/configurator/ConfiguratorViewer.tsx`:
```tsx
'use client'
import type { ConfiguratorView } from '@/types'
import ImageSequenceViewer from './ImageSequenceViewer'
import ThreeDViewer from './ThreeDViewer'

// Placeholder image sets — replace with real assets
const PLACEHOLDER_IMAGES = {
  exterior: {
    branco: ['/images/placeholder-hero.jpg'],
    azul: ['/images/placeholder-hero.jpg'],
    cinzento: ['/images/placeholder-hero.jpg'],
  },
  interior: {
    branco: ['/images/placeholder-hero.jpg'],
    azul: ['/images/placeholder-hero.jpg'],
    cinzento: ['/images/placeholder-hero.jpg'],
  },
}

interface ConfiguratorViewerProps {
  view: ConfiguratorView
  colorId: string
}

const mode = process.env.NEXT_PUBLIC_CONFIGURATOR_MODE ?? 'image-sequence'

export default function ConfiguratorViewer({ view, colorId }: ConfiguratorViewerProps) {
  if (mode === '3d') {
    return <ThreeDViewer view={view} colorId={colorId} />
  }
  return <ImageSequenceViewer view={view} colorId={colorId} images={PLACEHOLDER_IMAGES} />
}
```

- [ ] **Step 5: Build Configurator section**

Create `src/components/sections/Configurator.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ConfiguratorViewer from '@/components/configurator/ConfiguratorViewer'
import ColorSwitcher from '@/components/configurator/ColorSwitcher'
import type { ConfiguratorView } from '@/types'

const VIEWS: { id: ConfiguratorView; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
]

// Replace with real color options from Nissan PT asset list
const COLORS = [
  { id: 'branco', label: 'Branco Pérola', hex: '#F0EDE8' },
  { id: 'azul', label: 'Azul Elétrico', hex: '#1A4FA0' },
  { id: 'cinzento', label: 'Cinzento Cósmico', hex: '#6B6B6B' },
]

export default function Configurator() {
  const [view, setView] = useState<ConfiguratorView>('exterior')
  const [colorId, setColorId] = useState(COLORS[0].id)

  return (
    <section id="configurador" className="py-24 px-6 md:px-12 bg-surface">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Descobre o teu Leaf.
      </motion.h2>

      {/* View toggle */}
      <div className="flex justify-center gap-1 mb-8">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${view === id ? 'bg-accent text-white' : 'text-text-secondary hover:text-white'}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      <ConfiguratorViewer view={view} colorId={colorId} />

      <ColorSwitcher colors={COLORS} activeColor={colorId} onSelect={setColorId} />
    </section>
  )
}
```

- [ ] **Step 6: Add to page.tsx**

```tsx
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import RangeSavings from '@/components/sections/RangeSavings'

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
      <Configurator />
      <RangeSavings />
    </main>
  )
}
```

- [ ] **Step 7: Verify**

Run `npm run dev`. Configurator section shows placeholder image, exterior/interior toggle works, color swatches are clickable. No console errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/configurator/ src/components/sections/Configurator.tsx src/app/page.tsx
git commit -m "feat: add 360 configurator with image-sequence viewer, color switcher, env-flag 3D toggle"
```

---

## Task 10: Zoho CRM API Route (TDD) + Contact Form

**Files:**
- Create: `src/lib/zoho.ts`
- Create: `src/app/api/leads/route.ts`
- Create: `tests/api/leads.test.ts`
- Create: `src/components/forms/ContactForm.tsx`

- [ ] **Step 1: Write failing tests for leads API route**

Create `tests/api/leads.test.ts`:
```typescript
import { POST } from '@/app/api/leads/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/zoho', () => ({
  createZohoLead: jest.fn(),
}))

import { createZohoLead } from '@/lib/zoho'
const mockCreateZohoLead = createZohoLead as jest.Mock

describe('POST /api/leads', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'João' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/i)
  })

  it('calls createZohoLead with correct data and returns 200', async () => {
    mockCreateZohoLead.mockResolvedValueOnce({ id: 'lead-123' })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        phone: '+351912345678',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockCreateZohoLead).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
    }))
  })

  it('returns 500 when Zoho call fails', async () => {
    mockCreateZohoLead.mockRejectedValueOnce(new Error('Zoho error'))
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'João', lastName: 'Silva',
        email: 'joao@example.com', phone: '+351912345678',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run to verify they fail**

```bash
npx jest tests/api/leads.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Zoho helper**

Create `src/lib/zoho.ts`:
```typescript
import type { LeadFormData } from '@/types'

const ZOHO_TOKEN_URL = 'https://accounts.zoho.eu/oauth/v2/token'
const ZOHO_LEADS_URL = 'https://www.zohoapis.eu/crm/v2/Leads'

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: 'refresh_token',
  })
  const res = await fetch(`${ZOHO_TOKEN_URL}?${params}`, { method: 'POST' })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get Zoho access token')
  return data.access_token
}

export async function createZohoLead(lead: LeadFormData): Promise<{ id: string }> {
  const token = await getAccessToken()
  const res = await fetch(ZOHO_LEADS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [{
        First_Name: lead.firstName,
        Last_Name: lead.lastName,
        Email: lead.email,
        Phone: lead.phone,
        Lead_Source: 'Leaf Landing Page',
        Description: lead.preferredContactTime ? `Melhor hora: ${lead.preferredContactTime}` : '',
      }],
    }),
  })
  const data = await res.json()
  const record = data.data?.[0]
  if (!record || record.status !== 'success') throw new Error('Zoho lead creation failed')
  return { id: record.details.id }
}
```

- [ ] **Step 4: Implement leads API route**

Create `src/app/api/leads/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createZohoLead } from '@/lib/zoho'
import type { LeadFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<LeadFormData>

  const { firstName, lastName, email, phone } = body
  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json({ error: 'firstName, lastName, email, and phone are required' }, { status: 400 })
  }

  try {
    const result = await createZohoLead({ firstName, lastName, email, phone, preferredContactTime: body.preferredContactTime })
    return NextResponse.json({ success: true, id: result.id })
  } catch {
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest tests/api/leads.test.ts --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 6: Build ContactForm component**

Create `src/components/forms/ContactForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { LeadFormData } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<Partial<LeadFormData>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (key: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-semibold mb-2">Obrigado!</p>
        <p className="text-text-secondary">A nossa equipa entrará em contacto em breve.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primeiro nome" value={form.firstName ?? ''} onChange={set('firstName')} required />
        <Field label="Apelido" value={form.lastName ?? ''} onChange={set('lastName')} required />
      </div>
      <Field label="Email" type="email" value={form.email ?? ''} onChange={set('email')} required />
      <Field label="Telefone" type="tel" value={form.phone ?? ''} onChange={set('phone')} required />
      <Field label="Melhor hora para contacto (opcional)" value={form.preferredContactTime ?? ''} onChange={set('preferredContactTime')} />

      <label className="flex gap-3 items-start text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-accent" />
        <span>
          Aceito que os meus dados sejam utilizados para fins de contacto comercial,
          de acordo com a{' '}
          <a href="/politica-de-privacidade" className="text-accent hover:underline">
            Política de Privacidade
          </a>.
        </span>
      </label>

      {status === 'error' && (
        <p className="text-red-400 text-sm">Ocorreu um erro. Por favor tenta novamente.</p>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'A enviar...' : 'Enviar'}
      </Button>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>
  type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/zoho.ts src/app/api/leads/ tests/api/leads.test.ts src/components/forms/ContactForm.tsx
git commit -m "feat: add Zoho CRM lead API route (TDD) and ContactForm component"
```

---

## Task 11: Stripe API Route (TDD) + CTA Section

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `tests/api/checkout.test.ts`
- Create: `src/components/sections/CTASection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write failing tests for checkout route**

Create `tests/api/checkout.test.ts`:
```typescript
import { POST } from '@/app/api/checkout/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockCreate = stripe.checkout.sessions.create as jest.Mock

describe('POST /api/checkout', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('creates a Stripe session and returns the URL', async () => {
    mockCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/session-123' })
    const req = new NextRequest(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://checkout.stripe.com/session-123')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      metadata: expect.objectContaining({ versionId: 'visia' }),
    }))
  })

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run to verify they fail**

```bash
npx jest tests/api/checkout.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Stripe client**

Create `src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
```

- [ ] **Step 4: Implement checkout API route**

Create `src/app/api/checkout/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const DEPOSIT_AMOUNT_CENTS = 30000 // €300.00

export async function POST(req: NextRequest) {
  const { versionId } = await req.json() as { versionId?: string }
  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: DEPOSIT_AMOUNT_CENTS,
          product_data: {
            name: 'Nissan Leaf — Depósito de Reserva',
            description: `Versão: ${versionId ?? 'a definir'}. Depósito totalmente reembolsável.`,
          },
        },
        quantity: 1,
      }],
      metadata: { versionId: versionId ?? '' },
      success_url: `${origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    })

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest tests/api/checkout.test.ts --no-coverage
```

Expected: PASS — 2 tests passing.

- [ ] **Step 6: Build CTASection**

Create `src/components/sections/CTASection.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ContactForm from '@/components/forms/ContactForm'

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
  const [loading, setLoading] = useState(false)

  const handleReserve = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: selectedVersion }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <section id="reservar" className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-start">

        {/* Left — Stripe */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Reserva o teu Leaf hoje.</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Garante o teu lugar com um depósito de €300, totalmente reembolsável.
            Sem compromisso adicional até à entrega.
          </p>
          <Button
            variant="primary"
            onClick={handleReserve}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'A redirecionar...' : 'Reservar agora — €300'}
          </Button>
          <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
            <span>🔒</span>
            <span>Pagamento seguro via Stripe · Depósito 100% reembolsável</span>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="hidden md:block absolute left-1/2 top-24 bottom-24 w-px bg-white/10" />

        {/* Right — Contact form */}
        <motion.div
          id="contacto"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Preferes falar primeiro?</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            A nossa equipa está pronta para responder a todas as tuas dúvidas.
          </p>
          <ContactForm />
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 7: Add to page.tsx**

```tsx
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import RangeSavings from '@/components/sections/RangeSavings'
import CTASection from '@/components/sections/CTASection'

export default function Home() {
  return (
    <main>
      <Hero />
      <Highlights />
      <Configurator />
      <RangeSavings />
      <CTASection />
    </main>
  )
}
```

- [ ] **Step 8: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests passing.

- [ ] **Step 9: Commit**

```bash
git add src/lib/stripe.ts src/app/api/checkout/ tests/api/checkout.test.ts src/components/sections/CTASection.tsx src/app/page.tsx
git commit -m "feat: add Stripe checkout API route (TDD) and dual-CTA section"
```

---

## Task 12: Version Comparison Table

**Files:**
- Create: `src/components/sections/VersionComparison.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Define version data (placeholder)**

The actual spec data arrives from Nissan PT. Until then, use placeholder data in the component itself. The structure is the source of truth — swapping content is a data-only change.

- [ ] **Step 2: Build VersionComparison**

`VersionComparison` receives an `onSelectVersion` callback prop. When the user clicks "Reservar" on a version, it calls this callback with the version ID and then smooth-scrolls to `#reservar`. The parent (`page.tsx`) stores the selected version in state and passes it down to `CTASection`, which forwards it to the Stripe API route as metadata.

Create `src/components/sections/VersionComparison.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface VersionComparisonProps {
  onSelectVersion: (versionId: string) => void
}

const VERSIONS = [
  {
    id: 'visia',
    name: 'Visia',
    price: 29990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': false,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': false,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'n-connecta',
    name: 'N-Connecta',
    price: 34490,
    isPopular: true,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': false,
      'Sistema de som premium': false,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
  {
    id: 'tekna',
    name: 'Tekna',
    price: 38990,
    isPopular: false,
    features: {
      'Jantes de liga leve 16"': true,
      'Faróis LED': true,
      'Ecrã 8" touchscreen': true,
      'Apple CarPlay / Android Auto': true,
      'Câmara de marcha-atrás': true,
      'Carregamento rápido CHAdeMO': true,
      'Teto de abrir': true,
      'Sistema de som premium': true,
      'Assistente de faixa': true,
      'Travagem automática de emergência': true,
    },
  },
]

const FEATURE_KEYS = Object.keys(VERSIONS[0].features)

export default function VersionComparison({ onSelectVersion }: VersionComparisonProps) {
  const handleReserve = (versionId: string) => {
    onSelectVersion(versionId)
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="versoes" className="py-24 px-6 md:px-12 bg-background">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Escolhe a tua versão.
      </motion.h2>

      {/* Desktop table */}
      <motion.div
        className="hidden md:grid grid-cols-3 gap-4 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {VERSIONS.map((v) => (
          <div
            key={v.id}
            className={`
              relative rounded-2xl overflow-hidden border
              ${v.isPopular ? 'border-accent bg-card' : 'border-white/5 bg-card/50'}
            `}
          >
            {v.isPopular && (
              <div className="bg-accent text-white text-xs font-semibold text-center py-1.5 tracking-wide">
                Mais popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{v.name}</h3>
              <p className="text-text-secondary text-sm mb-6">
                desde{' '}
                <span className="text-white font-semibold text-lg">
                  €{v.price.toLocaleString('pt-PT')}
                </span>
              </p>

              <div className="space-y-3 mb-8">
                {FEATURE_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className={v.features[key as keyof typeof v.features] ? 'text-accent' : 'text-white/20'}>
                      {v.features[key as keyof typeof v.features] ? '✓' : '—'}
                    </span>
                    <span className={v.features[key as keyof typeof v.features] ? 'text-text-secondary' : 'text-white/20'}>
                      {key}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Button
                  variant={v.isPopular ? 'primary' : 'ghost'}
                  className="w-full"
                  onClick={() => handleReserve(v.id)}
                >
                  Reservar
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs py-2"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Saber mais
                </Button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Mobile carousel */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {VERSIONS.map((v) => (
          <div key={v.id} className="snap-center shrink-0 w-80">
            <div className={`rounded-2xl border ${v.isPopular ? 'border-accent bg-card' : 'border-white/5 bg-card/50'}`}>
              {v.isPopular && (
                <div className="bg-accent text-white text-xs font-semibold text-center py-1.5">Mais popular</div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{v.name}</h3>
                <p className="text-text-secondary text-sm mb-4">desde €{v.price.toLocaleString('pt-PT')}</p>
                <Button variant={v.isPopular ? 'primary' : 'ghost'} className="w-full" onClick={() => handleReserve(v.id)}>
                  Reservar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add to page.tsx (intermediate)**

Add `<VersionComparison onSelectVersion={() => {}} />` after `<RangeSavings />` and before `<CTASection />`. Use an empty callback for now — the full wiring happens in Task 13 when `page.tsx` is rewritten as a Client Component with state.

- [ ] **Step 4: Verify**

Desktop: 3 columns with middle column highlighted. Mobile: horizontal swipe carousel.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/VersionComparison.tsx src/app/page.tsx
git commit -m "feat: add Version Comparison section with 3-column table and mobile carousel"
```

---

## Task 13: Closing Section

**Files:**
- Create: `src/components/sections/ClosingSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build ClosingSection**

Create `src/components/sections/ClosingSection.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function ClosingSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/placeholder-hero.jpg"
          alt="Nissan Leaf"
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          O futuro é elétrico.
          <br />
          E é agora.
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Ser contactado
          </Button>
        </div>
      </motion.div>

      {/* Footer bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-8 py-4 bg-black/60 text-xs text-white/40">
        <span>© 2026 Nissan Portugal</span>
        <a href="/politica-de-privacidade" className="hover:text-white transition-colors">Política de Privacidade</a>
        <a href="/termos" className="hover:text-white transition-colors">Termos e Condições</a>
        <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
        <a href="#contacto" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); scrollTo('contacto') }}>Contacto</a>
        <span className="w-full text-center mt-1">
          Imagens meramente ilustrativas. Preços e equipamentos sujeitos a alteração.
        </span>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx (final assembly)**

`page.tsx` must be a Client Component here because it holds `selectedVersion` state shared between `VersionComparison` (setter) and `CTASection` (reader).

Replace `src/app/page.tsx` with the complete assembled page:
```tsx
'use client'
import { useState } from 'react'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import RangeSavings from '@/components/sections/RangeSavings'
import VersionComparison from '@/components/sections/VersionComparison'
import CTASection from '@/components/sections/CTASection'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined)

  return (
    <main>
      <Hero />
      <Highlights />
      <Configurator />
      <RangeSavings />
      <VersionComparison onSelectVersion={setSelectedVersion} />
      <CTASection selectedVersion={selectedVersion} />
      <ClosingSection />
    </main>
  )
}
```

Note: `VersionComparison` now appears before `CTASection` so the user sees the version options before the commitment step — a stronger conversion flow.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ClosingSection.tsx src/app/page.tsx
git commit -m "feat: add Closing section with fullscreen image, dual CTAs, and legal footer bar"
```

---

## Task 14: /obrigado Page

**Files:**
- Create: `src/app/obrigado/page.tsx`

- [ ] **Step 1: Build the success page**

Create `src/app/obrigado/page.tsx`:
```tsx
import { Suspense } from 'react'
import ObrigadoContent from './ObrigadoContent'

export const metadata = { title: 'Reserva confirmada — Nissan Leaf' }

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <Suspense fallback={<p className="text-text-secondary">A carregar...</p>}>
        <ObrigadoContent />
      </Suspense>
    </main>
  )
}
```

Create `src/app/obrigado/ObrigadoContent.tsx`:
```tsx
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

interface OrderDetails {
  email: string
  amount: string
  paymentIntentId: string
}

export default function ObrigadoContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [order, setOrder] = useState<OrderDetails | null>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/checkout/session?id=${sessionId}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => null)
  }, [sessionId])

  return (
    <div className="max-w-xl text-center">
      <div className="text-5xl mb-6">✓</div>
      <h1 className="text-4xl font-bold mb-4">Reserva confirmada.</h1>
      <p className="text-xl text-text-secondary mb-2">Bem-vindo ao futuro.</p>
      <p className="text-text-secondary mb-8">
        O teu depósito de €300 foi recebido. A nossa equipa irá entrar em contacto em breve
        para confirmar os detalhes da tua encomenda.
      </p>

      {order && (
        <div className="bg-card rounded-xl p-5 text-left mb-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span>{order.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Valor pago</span>
            <span>{order.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Referência</span>
            <span className="font-mono text-xs">{order.paymentIntentId}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="primary" onClick={() => window.location.href = '/'}>
          Voltar ao início
        </Button>
        <Button variant="ghost" onClick={() => { window.location.href = '/#contacto' }}>
          Falar com a equipa
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add session retrieval API route**

Create `src/app/api/checkout/session/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['payment_intent'],
    })
    const pi = session.payment_intent as { id: string } | null

    return NextResponse.json({
      email: session.customer_details?.email ?? '',
      amount: `€${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      paymentIntentId: pi?.id ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
```

- [ ] **Step 3: Verify**

**Important:** Create both `src/app/obrigado/ObrigadoContent.tsx` (Step 1) AND `src/app/api/checkout/session/route.ts` (Step 2) before testing — `ObrigadoContent` calls the session API on mount, so the route must exist first or you'll get a 404 in the console.

Run `npm run dev` and navigate to `http://localhost:3000/obrigado` — should show the confirmation page. Without a real `session_id` query param, the order summary block will simply not render (the `setOrder` call will fail silently).

- [ ] **Step 4: Commit**

```bash
git add src/app/obrigado/ src/app/api/checkout/session/
git commit -m "feat: add /obrigado success page with Stripe session order summary"
```

---

## Task 15: Cookie Consent + Final Polish

**Files:**
- Create: `src/components/CookieBanner.tsx`
- Modify: `src/app/layout.tsx`
- Modify: Various section components (responsive final pass)

- [ ] **Step 1: Install cookie consent library**

```bash
npm install react-cookie-consent
```

- [ ] **Step 2: Add cookie banner to layout**

Create `src/components/CookieBanner.tsx`:
```tsx
'use client'
import CookieConsent from 'react-cookie-consent'

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceitar"
      declineButtonText="Recusar"
      enableDeclineButton
      cookieName="leaf-cookie-consent"
      style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}
      buttonStyle={{ background: '#0070C9', color: 'white', borderRadius: '999px', padding: '8px 20px', fontSize: '13px' }}
      declineButtonStyle={{ background: 'transparent', color: '#A1A1A1', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '8px 20px', fontSize: '13px' }}
    >
      Utilizamos cookies para melhorar a tua experiência.{' '}
      <a href="/cookies" className="text-accent underline">Saber mais</a>
    </CookieConsent>
  )
}
```

Add to `src/app/layout.tsx`:
```tsx
import CookieBanner from '@/components/CookieBanner'
// ... in body:
<CookieBanner />
{children}
```

- [ ] **Step 3: Final responsive audit**

Run `npm run dev` and check on narrow viewport (375px width in DevTools):
- [ ] Hero: CTAs stack vertically ✓
- [ ] Highlights: horizontal scroll carousel ✓
- [ ] Configurator: swipe works, swatches tappable ✓
- [ ] Range & Savings: horizontal carousel, modal full-screen ✓
- [ ] CTA section: Stripe CTA above, form below ✓
- [ ] Version comparison: swipe carousel ✓
- [ ] Closing: image full-screen, CTAs stack ✓
- [ ] Navbar: hidden on very small screens or collapses to logo + CTA ✓

Fix any overflow or layout issues found.

- [ ] **Step 4: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests passing.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: build completes with no errors. Fix any TypeScript or ESLint errors found.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: add cookie consent, complete responsive polish, full page assembled"
```

---

## Task 16: Deploy to Vercel

**Files:** None — deployment config only.

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-org>/leaf-presales.git
git push -u origin main
```

- [ ] **Step 2: Import project in Vercel**

Go to `vercel.com` → New Project → Import the GitHub repo. Select framework: Next.js (auto-detected).

- [ ] **Step 3: Add environment variables in Vercel dashboard**

Add all variables from `.env.local.example` with their production values:
- `STRIPE_SECRET_KEY` (production key from Stripe dashboard)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`
- `NEXT_PUBLIC_CONFIGURATOR_MODE=image-sequence`

- [ ] **Step 4: Deploy**

Vercel deploys automatically on push. Verify the production URL loads correctly.

- [ ] **Step 5: Smoke test production**

- [ ] Hero video loads, CTAs work
- [ ] Clicking "Reservar agora" redirects to Stripe checkout
- [ ] Contact form submits (check Zoho CRM for the lead)
- [ ] `/obrigado` page renders after test Stripe payment
- [ ] Navbar appears on scroll
- [ ] Cookie banner appears on first visit

---

## Running All Tests

```bash
# Run all tests
npx jest --no-coverage

# Run specific test suite
npx jest tests/lib/savings.test.ts
npx jest tests/api/

# Type check
npx tsc --noEmit

# Build check
npm run build
```

---

## Asset Swap Checklist

When real Nissan assets arrive, replace placeholders in:

| Asset | Current placeholder | File to update |
|-------|--------------------|-|
| Hero video | `/videos/placeholder-hero.mp4` | `src/components/sections/Hero.tsx` |
| Hero poster | `/images/placeholder-hero.jpg` | `src/components/sections/Hero.tsx` |
| Highlight card images | `/images/placeholder-hero.jpg` | `src/components/sections/Highlights.tsx` (HIGHLIGHTS array) |
| Configurator image frames | `/images/placeholder-hero.jpg` | `src/components/configurator/ConfiguratorViewer.tsx` (PLACEHOLDER_IMAGES) |
| Closing section image | `/images/placeholder-hero.jpg` | `src/components/sections/ClosingSection.tsx` |
| Vehicle colors | Placeholder hex values | `src/components/sections/Configurator.tsx` (COLORS array) |
| Version data | Placeholder prices/features | `src/components/sections/VersionComparison.tsx` (VERSIONS array) |
| 3D GLB model | N/A (stub) | Set `NEXT_PUBLIC_CONFIGURATOR_MODE=3d`, implement `ThreeDViewer.tsx` |
