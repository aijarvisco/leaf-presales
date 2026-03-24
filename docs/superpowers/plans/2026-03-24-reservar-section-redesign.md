# Reservar Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `#reservar` area into a white-background reservation section (FAQ + Stripe) and a new "not ready" LeadSection (image banner + contact drawer).

**Architecture:** Five focused changes — light-mode Stripe form styling, CTASection restructure (FAQ left / Stripe right), new `ContactDrawer` portal component, new `LeadSection` with image banner, and wiring `LeadSection` into `page.tsx`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, React portals, `@stripe/react-stripe-js`, `next/image`, `framer-motion`

**Spec:** `docs/superpowers/specs/2026-03-24-reservar-section-redesign.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/forms/StripePaymentForm.tsx` | Modify | Light-mode input/card styling |
| `src/components/sections/CTASection.tsx` | Modify | White bg, FAQ accordion left, Stripe right |
| `src/components/ui/ContactDrawer.tsx` | Create | Portal slide panel with ContactForm |
| `src/components/sections/LeadSection.tsx` | Create | Image banner + "Ainda com dúvidas?" title |
| `src/app/page.tsx` | Modify | Add `<LeadSection />` before `<ClosingSection />` |

---

## Task 1: Light-mode StripePaymentForm styling

**Files:**
- Modify: `src/components/forms/StripePaymentForm.tsx:23-37`

The file has two constants that hard-code the dark theme: `inputClass` (line 23) and `cardElementStyle` (line 26). Replace both with light-mode values. Also update the skeleton pulse divs (line 74-81) to use `bg-gray-100` instead of `bg-card` so they don't look odd on a white background.

- [ ] **Step 1: Update `inputClass` constant**

In `src/components/forms/StripePaymentForm.tsx`, replace line 23-24:
```ts
const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-sm text-white placeholder-[#A1A1A1] focus:border-[#0070C9] focus:outline-none'
```
with:
```ts
const inputClass =
  'w-full rounded-lg border border-[#D1D1D1] bg-white px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#A1A1A1] focus:border-[#0070C9] focus:outline-none'
```

- [ ] **Step 2: Update `cardElementStyle` constant**

Replace lines 26-37:
```ts
const cardElementStyle = {
  style: {
    base: {
      color: '#FFFFFF',
      fontFamily: 'inherit',
      fontSize: '14px',
      '::placeholder': { color: '#A1A1A1' },
      backgroundColor: '#1A1A1A',
    },
    invalid: { color: '#f87171' },
  },
}
```
with:
```ts
const cardElementStyle = {
  style: {
    base: {
      color: '#0A0A0A',
      fontFamily: 'inherit',
      fontSize: '14px',
      '::placeholder': { color: '#A1A1A1' },
      backgroundColor: '#FFFFFF',
    },
    invalid: { color: '#dc2626' },
  },
}
```

- [ ] **Step 3: Update skeleton divs**

Replace the skeleton block (lines 73-83):
```tsx
<div data-testid="payment-form-skeleton" className="space-y-3 animate-pulse">
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-10 rounded-lg bg-card" />
  <div className="h-11 rounded-lg bg-card" />
</div>
```
with:
```tsx
<div data-testid="payment-form-skeleton" className="space-y-3 animate-pulse">
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-10 rounded-lg bg-gray-100" />
  <div className="h-11 rounded-lg bg-gray-100" />
</div>
```

- [ ] **Step 4: Update the CardElement wrapper border**

Replace the CardElement wrapper div (line 236):
```tsx
<div className="rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3">
```
with:
```tsx
<div className="rounded-lg border border-[#D1D1D1] bg-white px-4 py-3">
```

- [ ] **Step 5: Update label colors**

All `<label>` elements in `CardElementForm` currently use `text-[#A1A1A1]`. On a white background these are too light. Replace all occurrences of `className="mb-1 block text-xs text-[#A1A1A1]"` with `className="mb-1 block text-xs text-[#6B6B6B]"` (all 6 labels: billing-name, billing-line1, billing-city, billing-postal, billing-country, billing-taxid).

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/forms/StripePaymentForm.tsx
git commit -m "feat: light-mode styling for StripePaymentForm"
```

---

## Task 2: Restructure CTASection

**Files:**
- Modify: `src/components/sections/CTASection.tsx`

Replace the entire file. The new layout: white background (`bg-white`), `pt-48 pb-48`, `max-w-5xl mx-auto px-6`. Two columns: left has the display title + paragraph + FAQ accordion; right has `StripePaymentForm` + security note. No framer-motion needed — keep it simple (the form itself has no animation in the current codebase either).

- [ ] **Step 1: Replace CTASection**

Write `src/components/sections/CTASection.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

const FAQS = [
  {
    q: 'O depósito é reembolsável?',
    a: 'Sim, 100% reembolsável sem qualquer condição antes da entrega.',
  },
  {
    q: 'Quando serei contactado após a reserva?',
    a: 'A nossa equipa entrará em contacto nas 48 horas seguintes.',
  },
  {
    q: 'Posso alterar a versão após reservar?',
    a: 'Sim, até à emissão da ordem de produção.',
  },
  {
    q: 'Qual é o prazo estimado de entrega?',
    a: 'Previsto para Q3/Q4 2025, sujeito a confirmação.',
  },
]

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="reservar" className="bg-white pt-48 pb-48">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left — title + FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-[56px] leading-tight font-medium text-[#0A0A0A] tracking-[-0.07em] mb-8">
              Reserva o teu Leaf hoje.
            </h2>
            <p className="text-[#0A0A0A] mb-10 leading-relaxed">
              Garante o teu lugar com um depósito de €300, totalmente reembolsável.
              Sem compromisso adicional até à entrega.
            </p>

            {/* FAQ accordion */}
            <div className="divide-y divide-[#E5E5E5]">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left text-[#0A0A0A] font-medium cursor-pointer"
                    aria-expanded={openIndex === i}
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 text-lg leading-none">
                      {openIndex === i ? '−' : '+'}
                    </span>
                  </button>
                  {openIndex === i && (
                    <p className="pb-4 text-sm text-[#6B6B6B] leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Stripe form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <StripePaymentForm versionId={selectedVersion} />
            <div className="flex items-center gap-2 mt-4 text-xs text-[#0A0A0A]">
              <span>🔒</span>
              <span>Pagamento seguro via Stripe · Depósito 100% reembolsável</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/CTASection.tsx
git commit -m "feat: restructure CTASection — FAQ accordion left, Stripe right, white bg"
```

---

## Task 3: Create ContactDrawer

**Files:**
- Create: `src/components/ui/ContactDrawer.tsx`

A portal-based slide-in drawer. Uses `ReactDOM.createPortal`. The `mounted` guard prevents SSR errors. The drawer panel is always in the DOM once mounted — open/close is CSS-only. The Escape key listener is added only when `isOpen === true`.

- [ ] **Step 1: Create ContactDrawer**

Write `src/components/ui/ContactDrawer.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ContactForm from '@/components/forms/ContactForm'

interface ContactDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactDrawer({ isOpen, onClose }: ContactDrawerProps) {
  const [mounted, setMounted] = useState(false)

  // SSR guard — only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key — only active when drawer is open
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Glass overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full md:w-1/3 bg-surface flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Pedir informações</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ContactForm />
        </div>
      </div>
    </>,
    document.body
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ContactDrawer.tsx
git commit -m "feat: add ContactDrawer portal component"
```

---

## Task 4: Create LeadSection

**Files:**
- Create: `src/components/sections/LeadSection.tsx`

White background section. Title "Ainda com dúvidas?" in display style matching Highlights. Image banner with gradient overlay and overlaid CTA. Owns `isOpen` state and renders `ContactDrawer`.

- [ ] **Step 1: Create LeadSection**

Write `src/components/sections/LeadSection.tsx`:
```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ContactDrawer from '@/components/ui/ContactDrawer'

export default function LeadSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="bg-white pt-48 pb-48">
      <div className="max-w-5xl mx-auto px-6">

        {/* Title */}
        <motion.h2
          className="text-[56px] leading-tight font-medium text-[#0A0A0A] tracking-[-0.07em] mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Ainda com dúvidas?
        </motion.h2>

        {/* Image banner */}
        <motion.div
          className="relative h-[480px] w-full overflow-hidden rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <Image
            src="/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg"
            alt="Nissan Leaf"
            fill
            className="object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Overlaid text + CTA */}
          <div className="absolute bottom-8 left-8">
            <p className="text-white text-xl font-medium mb-4">
              Fala com a nossa equipa.
            </p>
            <Button variant="primary" onClick={() => setIsOpen(true)}>
              Pedir informações
            </Button>
          </div>
        </motion.div>

      </div>

      <ContactDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/LeadSection.tsx
git commit -m "feat: add LeadSection with image banner and contact drawer"
```

---

## Task 5: Wire LeadSection into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

Add the `LeadSection` import and place it between `<CTASection />` and `<ClosingSection />`.

- [ ] **Step 1: Add import**

In `src/app/page.tsx`, add after the existing imports:
```tsx
import LeadSection from '@/components/sections/LeadSection'
```

- [ ] **Step 2: Add component**

In the JSX, add `<LeadSection />` between `<CTASection selectedVersion={selectedVersion} />` and `<ClosingSection />`:
```tsx
<CTASection selectedVersion={selectedVersion} />
<LeadSection />
<ClosingSection />
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Build check**

```bash
npm run build
```
Expected: builds successfully with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire LeadSection into page between CTASection and ClosingSection"
```
