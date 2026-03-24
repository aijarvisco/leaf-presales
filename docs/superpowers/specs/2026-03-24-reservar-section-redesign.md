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

### Props

`selectedVersion?: string` — existing prop, passed from `page.tsx` (set by `Configurador` via `onSelectVersion`). Passed through to `StripePaymentForm` as `versionId`. No change to this data flow.

### Layout

Two-column grid (`md:grid-cols-2`), items aligned to start. Section background: `bg-surface`.

### Left Column

- **Title:** "Reserva o teu Leaf hoje."
- **Paragraph:** "Garante o teu lugar com um depósito de €300, totalmente reembolsável. Sem compromisso adicional até à entrega."
- **FAQ Accordion** — 4 items, one open at a time (controlled local state):
  1. *O depósito é reembolsável?* — Sim, 100% reembolsável sem qualquer condição antes da entrega.
  2. *Quando serei contactado após a reserva?* — A nossa equipa entrará em contacto nas 48 horas seguintes.
  3. *Posso alterar a versão após reservar?* — Sim, até à emissão da ordem de produção.
  4. *Qual é o prazo estimado de entrega?* — Previsto para Q3/Q4 2025, sujeito a confirmação.

Accordion uses local `useState<number | null>` (index of open item, `null` = all closed) — no external library. Initial state: `null` (all closed — no item pre-opened). Up to one item open at a time; clicking an open item sets state back to `null`.

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

1. **Eyebrow label** — small, intentionally left-aligned (not centered): *"Ainda com dúvidas?"*
2. **Image banner** — full-width, ~480px tall. DOM structure:
   ```
   <div class="relative h-[480px] w-full overflow-hidden rounded-xl">  ← positioned container
     <Image fill object-cover ... />                                    ← next/image with fill
     <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />  ← overlay
     <div class="absolute bottom-8 left-8 ...">                        ← text + CTA
       <p>Fala com a nossa equipa.</p>
       <Button>Pedir informações</Button>
     </div>
   </div>
   ```
   - Image: `/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg` (file confirmed at `public/images/889858a-F275-25TDIEULHD_PZ1D_02_LO.jpg`)
   - Use `next/image` with `fill` and `className="object-cover"`. Parent container must be `position: relative` with explicit height.
   - CTA button: *"Pedir informações"* — triggers `ContactDrawer` open.

### State

`LeadSection` owns `const [isOpen, setIsOpen] = useState(false)`. The CTA button's `onClick` calls `setIsOpen(true)`. `ContactDrawer` receives `isOpen={isOpen}` and `onClose={() => setIsOpen(false)}`.

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

- Must include `'use client'` directive.
- Rendered via `ReactDOM.createPortal` into `document.body`. Use a `mounted` boolean state (set to `true` in a `useEffect` with empty deps `[]`) to guard portal rendering — `document` is not available during SSR. Return `null` until `mounted === true`.
- Once the portal renders (after first client paint), the **drawer panel and overlay are never removed from the DOM** — `isOpen` only toggles CSS classes. Do not use `{isOpen && <panel />}`. This ensures the slide animation plays on every open.
- Closes on: overlay click, × button click, Escape key.
- Escape key: inside `ContactDrawer`, add a `useEffect([isOpen])` that — when `isOpen === true` — attaches a `keydown` listener to `window` and calls `onClose` on Escape. The cleanup function removes the listener. When `isOpen === false` the listener is not added.
- Animation via Tailwind classes on the drawer panel:
  - Closed: `translate-x-full`
  - Open: `translate-x-0`
  - Transition: `transition-transform duration-300 ease-in-out`

### Glass Overlay

- Full-screen fixed backdrop: `bg-black/60 backdrop-blur-sm`
- `z-40`, sits behind the drawer panel.
- Visibility toggled via `opacity-0 pointer-events-none` (closed) / `opacity-100` (open) with `transition-opacity duration-300`.

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
| `page.tsx` | `src/app/page.tsx` | Add `<LeadSection />` between `<CTASection />` and `<ClosingSection />` |

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

## Accepted Limitations

- `ContactForm` inside the drawer receives no contextual data (e.g., selected car version). It submits to `/api/leads` with only the fields it already collects. If version context is needed in the future, `ContactForm` props will need to be extended.
- `ContactForm` already renders its own submit button — no additional submit affordance is needed in the drawer.
- Accessibility (focus trap, `aria-hidden`, `inert` on closed drawer) is out of scope for this implementation.
- Custom Tailwind tokens (`bg-surface`, `bg-background`, `text-text-secondary`, etc.) are defined in `src/app/globals.css` under `@theme` and are available throughout the codebase.
