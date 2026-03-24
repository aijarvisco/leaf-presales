# Reservar Section Redesign

**Date:** 2026-03-24
**Status:** Approved

## Overview

Redesign the `#reservar` area into two distinct sections:

1. **CTASection (redesigned)** — reservation-focused, split layout with FAQ accordion on the left and Stripe form on the right.
2. **LeadSection (new)** — for users not yet ready to reserve, featuring an image banner with a CTA that opens a contact drawer.

---

## Section 1: CTASection (redesigned)

**File:** `src/components/sections/CTASection.tsx`

### Layout

Two-column grid (`md:grid-cols-2`), items aligned to start.

### Left Column

- **Title:** "Reserva o teu Leaf hoje."
- **Paragraph:** "Garante o teu lugar com um depósito de €300, totalmente reembolsável. Sem compromisso adicional até à entrega."
- **FAQ Accordion** — 4 items, one open at a time (controlled local state):
  1. *O depósito é reembolsável?* — Sim, 100% reembolsável sem qualquer condição antes da entrega.
  2. *Quando serei contactado após a reserva?* — A nossa equipa entrará em contacto nas 48 horas seguintes.
  3. *Posso alterar a versão após reservar?* — Sim, até à emissão da ordem de produção.
  4. *Qual é o prazo estimado de entrega?* — Previsto para Q3/Q4 2025, sujeito a confirmação.

Accordion uses local `useState` — no external library. One item open at a time; clicking an open item closes it.

### Right Column

- Existing `StripePaymentForm` component, unchanged.
- Security note below: "Pagamento seguro via Stripe · Depósito 100% reembolsável".

---

## Section 2: LeadSection (new)

**File:** `src/components/sections/LeadSection.tsx`

### Layout

- Background: `bg-background` (visually separates from `CTASection` which uses `bg-surface`).
- Padding consistent with other sections (`py-24 px-6 md:px-12`).

### Content

1. **Eyebrow label** — small, left-aligned: *"Ainda com dúvidas?"*
2. **Image banner** — full-width, ~480px tall, using `next/image` with `object-cover`.
   - Image: `/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg`
   - Dark gradient overlay (bottom-to-top, `from-black/70 to-transparent`) for text legibility.
   - Overlaid in the bottom-left area:
     - Small title: *"Fala com a nossa equipa."*
     - CTA button: *"Pedir informações"* — triggers `ContactDrawer` open.

### State

`isOpen: boolean` lives in `LeadSection`. Passed as props to `ContactDrawer`.

---

## Section 3: ContactDrawer (new)

**File:** `src/components/ui/ContactDrawer.tsx`

### Props

```ts
interface ContactDrawerProps {
  isOpen: boolean
  onClose: () => void
}
```

### Behaviour

- Rendered via `ReactDOM.createPortal` into `document.body`.
- Closes on: overlay click, × button click, Escape key.
- Slide-in animation: CSS `transform: translateX(100%)` → `translateX(0)` via Tailwind transition classes.

### Glass Overlay

- Full-screen fixed backdrop: `bg-black/60 backdrop-blur-sm`
- `z-40`, sits behind the drawer panel.

### Drawer Panel

- `fixed right-0 top-0 h-full w-full md:w-1/3`
- Background: `bg-surface` (`#111111`)
- `z-50`, slides in from the right.
- Contains:
  - Close button (×) top-right.
  - Small title: *"Pedir informações"*
  - Existing `ContactForm` component, unchanged.

---

## Component Breakdown

| Component | File | Change |
|---|---|---|
| `CTASection` | `src/components/sections/CTASection.tsx` | Restructured — left: FAQ + title, right: Stripe |
| `LeadSection` | `src/components/sections/LeadSection.tsx` | New |
| `ContactDrawer` | `src/components/ui/ContactDrawer.tsx` | New |
| `ContactForm` | `src/components/forms/ContactForm.tsx` | No change |
| `StripePaymentForm` | `src/components/forms/StripePaymentForm.tsx` | No change |
| `page.tsx` | `src/app/page.tsx` | Add `<LeadSection />` after `<CTASection />` |

---

## Data Flow

```
page.tsx
  └── CTASection (selectedVersion prop)
        └── StripePaymentForm
  └── LeadSection
        └── ContactDrawer (isOpen, onClose)
              └── ContactForm
```

---

## Out of Scope

- No changes to `ContactForm` or `StripePaymentForm` internals.
- No animation library changes — use Tailwind transitions only for the drawer.
- No new API routes.
