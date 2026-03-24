# Site Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-triggered Navbar with a static SiteHeader that, together with the Hero, fills exactly one screen height.

**Architecture:** A `h-screen flex flex-col` wrapper in `page.tsx` contains `<SiteHeader>` (h-14) and `<Hero>` (flex-1). SiteHeader is a new `'use client'` component with the Nissan wordmark on the left and two buttons (ghost + primary) on the right. The old Navbar is deleted.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Framer Motion, `next/image`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/layout/SiteHeader.tsx` | **Create** | Static header bar with logo and CTAs |
| `src/components/layout/Navbar.tsx` | **Delete** | No longer used |
| `src/app/layout.tsx` | **Modify** | Remove commented-out Navbar import |
| `src/app/page.tsx` | **Modify** | Add SiteHeader; wrap header+hero in 100vh flex container |
| `src/components/sections/Hero.tsx` | **Modify** | Change `h-screen` → `flex-1` on `<section>` |

---

### Task 1: Create SiteHeader component

**Files:**
- Create: `src/components/layout/SiteHeader.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function SiteHeader() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="flex items-center justify-between px-8 md:px-16 h-14 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
      <Image
        src="/nissan-lettering.svg"
        alt="Nissan"
        width={120}
        height={17}
        style={{ filter: 'brightness(0) invert(1)' }}
        priority
      />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-xs px-5 py-2"
          onClick={() => scrollTo('contacto')}
        >
          Ser Contactado
        </Button>
        <Button
          variant="primary"
          className="text-xs px-5 py-2"
          onClick={() => scrollTo('reservar')}
        >
          Reservar
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `cat src/components/layout/SiteHeader.tsx`
Expected: File contents printed with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SiteHeader.tsx
git commit -m "feat: add static SiteHeader with logo and CTA buttons"
```

---

### Task 2: Wire SiteHeader into the page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update `page.tsx`**

Import SiteHeader and wrap it with Hero in a 100vh flex column:

```tsx
'use client'
import { useState } from 'react'
import SiteHeader from '@/components/layout/SiteHeader'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import Configurator from '@/components/sections/Configurator'
import AutonomiaSectionV2 from '@/components/sections/AutonomiaSectionV2'
import ValuesSection from '@/components/sections/ValuesSection'
import Configurador from '@/components/sections/Configurador'
import CTASection from '@/components/sections/CTASection'
import ClosingSection from '@/components/sections/ClosingSection'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined)

  return (
    <main>
      <div className="h-screen flex flex-col">
        <SiteHeader />
        <Hero />
      </div>
      <Highlights />
      <AutonomiaSectionV2 />
      <ValuesSection />
      <Configurator />
      <Configurador onSelectVersion={setSelectedVersion} />
      <CTASection selectedVersion={selectedVersion} />
      <ClosingSection />
    </main>
  )
}
```

- [ ] **Step 2: Clean up `layout.tsx`**

Delete the commented-out Navbar import line (line 4: `import Navbar from '@/components/layout/Navbar'`) and the commented JSX line `{/* <Navbar /> */}`. The file should look like:

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const nissanBrand = localFont({
  src: [
    { path: '../../public/fonts/Nissan Brand Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-nissan',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={nissanBrand.variable}>
      <body className={nissanBrand.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: wire SiteHeader into page, remove Navbar from layout"
```

---

### Task 3: Update Hero to flex-1

**Files:**
- Modify: `src/components/sections/Hero.tsx:54`

- [ ] **Step 1: Change `h-screen` to `flex-1` on the section element**

In `src/components/sections/Hero.tsx`, find line 54:
```tsx
<section ref={heroRef} className="relative h-screen overflow-hidden">
```

Change to:
```tsx
<section ref={heroRef} className="relative flex-1 overflow-hidden">
```

No other changes needed.

- [ ] **Step 2: Verify the page renders correctly**

Run the dev server and open the browser:
```bash
npm run dev
```

Expected:
- Header bar visible at top (~56px tall) with Nissan wordmark (white) on left, "Ser Contactado" ghost button + "Reservar" primary button on right
- Header + Hero together fill exactly the viewport height (no scroll needed to see the fold)
- A thin subtle line separates header from hero
- "Ser Contactado" scrolls to the contact form
- "Reservar" scrolls to the reservation section
- Scrolling down works normally; header scrolls away with the page

- [ ] **Step 3: Delete old Navbar and commit everything**

```bash
git rm src/components/layout/Navbar.tsx
git add src/components/sections/Hero.tsx
git commit -m "feat: hero uses flex-1 to fill remaining 100vh below header; remove old Navbar"
```

---

## Done

The page should now show a full-screen first viewport: static header at top + video hero filling the rest. The old Navbar file is gone.
