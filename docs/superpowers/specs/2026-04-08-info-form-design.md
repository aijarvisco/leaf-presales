# InfoFormSection Design Spec
**Date:** 2026-04-08

## Overview

A new page section (`InfoFormSection`) placed just before `ClosingSection` in `page.tsx`. It serves as a final lead-capture moment — a split layout with a content block + contact form on the left and a full-bleed image on the right.

---

## Files

### New
- `src/components/sections/InfoFormSection.tsx` — section component
- `src/app/api/contact/route.ts` — new POST endpoint (separate from `/api/leads`)
- `src/data/concessionarios.json` — district → dealers mapping (user-supplied JSON)

### Modified
- `src/types/index.ts` — add `ContactFormData` interface
- `src/app/page.tsx` — insert `<InfoFormSection />` before `<ClosingSection />`

---

## Layout

### Desktop (md+)

Two-column grid inside `max-w-5xl mx-auto px-6`:

- **Left column** — content block + form, aligned to page container
- **Right column** — image, sticky, bleeds to the viewport right edge via negative right margin (`-mr-6 md:-mr-[calc((100vw-1024px)/2+24px)]`)

### Mobile

Single column. Image is hidden. Content and form stack vertically.

### Section padding

Follows existing convention: `pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48 bg-white`

---

## Left Column — Content Block

Matches the `ValuesSection` tagline/title/paragraph pattern exactly:

```tsx
<p className="font-medium text-xl text-[#86868b] mb-2 tracking-[-0.07em] leading-none">{tagline}</p>
<h2 className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-none" style={{ fontSize: 'var(--text-h2)' }}>{title}</h2>
<p className="mt-6 text-xl text-[#0A0A0A] leading-relaxed">{paragraph}</p>
```

Default copy (hardcoded in the component, not props):
- **Tagline:** `"Contacto"`
- **Title:** `"Fale connosco."`
- **Paragraph:** `"Preencha o formulário e um representante Nissan entrará em contacto consigo em breve."`

---

## Left Column — Form

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `nome` | text input | yes | — |
| `telemovel` | tel input | yes | — |
| `email` | email input | yes | — |
| `distrito` | select | yes | Populated from `concessionarios.json` district keys |
| `concessionarioId` | select | yes | Filtered by selected distrito; label = `designation`, value = `objectId`; entries with `address === "GRUPO"` are excluded |
| `mensagem` | textarea | no | — |
| Privacy policy checkbox | checkbox | yes | Links to `/politica-de-privacidade` |
| Marketing consent checkbox | checkbox | no | — |

When `distrito` changes, `concessionarioId` resets to empty and its options repopulate.

### Submit Button

Uses existing `Button` component, `variant="primary"`, full width.

### Status States

- **loading** — button disabled, shows "A enviar..."
- **success** — form replaced with inline thank-you message
- **error** — inline error message below submit button

---

## Right Column — Image

- Source: `public/images/nissan_leaf_driving_cta.webp`
- `position: sticky`, `top: 0`, full column height
- `object-cover` via Next.js `<Image fill />`
- Bleeds to viewport right edge on desktop
- Hidden on mobile (`hidden md:block`)

---

## Animations

Framer-motion, same pattern as `CTASection`:
- Left column: `opacity: 0 → 1`, `y: 20 → 0`, `duration: 0.55`, `whileInView`, `once: true`
- Right column: same but `delay: 0.1`

---

## Data

### `src/data/concessionarios.json`

Shape:
```json
[
  {
    "district": "ILHA DE SÃO MIGUEL",
    "dealers": [
      {
        "designation": "Auto Elge - Com. e Rep. de Aut.,LDA",
        "objectId": "NI00100003",
        "address": "R.EDUARDO SOARES...",
        ...
      }
    ]
  }
]
```

Filtering rule: exclude any dealer where `address === "GRUPO"`.

---

## Type

```ts
// src/types/index.ts
export interface ContactFormData {
  nome: string
  telemovel: string
  email: string
  distrito: string
  concessionarioId: string  // objectId
  mensagem?: string
  privacyConsent: boolean
  marketingConsent: boolean
}
```

---

## API — `POST /api/contact`

**Required fields:** `nome`, `telemovel`, `email`, `distrito`, `concessionarioId`, `privacyConsent: true`

**Validation failure:** `400 { error: '...' }`

**Success:** `200 { success: true }`

Backend integration (CRM/email) is out of scope — route validates and returns success only.

---

## Page Integration

In `src/app/page.tsx`, insert before `<ClosingSection />`:

```tsx
import InfoFormSection from '@/components/sections/InfoFormSection'
// ...
<InfoFormSection />
<ClosingSection />
```
