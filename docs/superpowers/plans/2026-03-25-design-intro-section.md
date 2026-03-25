# DesignIntroSection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-viewport scroll-triggered section between `Highlights` and `AutonomiaSectionV2` that shows a label and title, then animates the Nissan Leaf top-view image sliding in from the right to cover the text.

**Architecture:** A single `'use client'` React component using framer-motion `whileInView` for viewport-triggered animations. The text block and car image are absolutely positioned inside a `relative` section; the car renders later in the DOM to naturally cover the text. No new dependencies.

**Tech Stack:** Next.js 16.2.0, React 19, framer-motion v12, Tailwind CSS v4, next/image

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/sections/DesignIntroSection.tsx` | The animated section component |
| Create | `tests/components/sections/DesignIntroSection.test.tsx` | Render + content tests |
| Modify | `src/app/page.tsx` | Insert `<DesignIntroSection />` between Highlights and AutonomiaSectionV2 |

---

## Task 1: Write the failing test

**Files:**
- Create: `tests/components/sections/DesignIntroSection.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Framer Motion uses browser APIs not available in jsdom.
// Mock motion.* so tests focus on markup, not animation.
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
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
  }
})

// next/image renders a plain <img> in tests
jest.mock('next/image', () =>
  React.forwardRef(({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>, ref) =>
    React.createElement('img', { src, alt, ...props, ref })
  )
)

import DesignIntroSection from '@/components/sections/DesignIntroSection'

describe('DesignIntroSection', () => {
  it('renders the section with the correct id', () => {
    render(<DesignIntroSection />)
    expect(document.getElementById('design-intro')).toBeInTheDocument()
  })

  it('renders the Design label', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<DesignIntroSection />)
    expect(screen.getByText('Uma forma que fala por si.')).toBeInTheDocument()
  })

  it('renders the car image with correct alt text', () => {
    render(<DesignIntroSection />)
    const img = screen.getByAltText('Nissan Leaf — vista de cima')
    expect(img).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx jest tests/components/sections/DesignIntroSection.test.tsx --no-coverage
```

Expected: 4 failures — `Cannot find module '@/components/sections/DesignIntroSection'`

---

## Task 2: Implement DesignIntroSection

**Files:**
- Create: `src/components/sections/DesignIntroSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function DesignIntroSection() {
  return (
    <section
      id="design-intro"
      className="relative min-h-screen overflow-hidden bg-[#D5D9DF]"
    >
      {/* Text block — renders first (below car in DOM stacking) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.p
          className="font-semibold text-sm tracking-widest uppercase text-[#0A0A0A]/60 mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          Design
        </motion.p>
        <motion.h2
          className="text-[56px] font-medium tracking-[-0.07em] leading-tight text-[#0A0A0A]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          Uma forma que fala por si.
        </motion.h2>
      </div>

      {/* Car image — renders after text, naturally sits on top */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D5D9DF]"
        initial={{ x: '110vw' }}
        whileInView={{ x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 1, delay: 0.5 }}
      >
        <Image
          src="/images/leaf-top-view.png"
          alt="Nissan Leaf — vista de cima"
          width={2680}
          height={1200}
          sizes="100vw"
          priority={false}
          className="w-screen min-w-[900px] h-auto"
        />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Run the tests to confirm they pass**

```bash
npx jest tests/components/sections/DesignIntroSection.test.tsx --no-coverage
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/DesignIntroSection.tsx tests/components/sections/DesignIntroSection.test.tsx
git commit -m "feat: add DesignIntroSection with scroll-triggered car animation"
```

---

## Task 3: Wire into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

In `src/app/page.tsx`, add the import after the `Highlights` import line:

```tsx
import DesignIntroSection from '@/components/sections/DesignIntroSection'
```

- [ ] **Step 2: Insert the section in JSX**

In the `<main>` block, insert `<DesignIntroSection />` between `<Highlights />` and `<AutonomiaSectionV2 />`:

```tsx
<Highlights />
<DesignIntroSection />
<AutonomiaSectionV2 />
```

- [ ] **Step 3: Run the full test suite to confirm nothing is broken**

```bash
npx jest --no-coverage
```

Expected: all existing tests continue to pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire DesignIntroSection into page between Highlights and AutonomiaSectionV2"
```
