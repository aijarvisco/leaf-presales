# Form Consent Fields, Stripe Security Badge & Copy Fixes

**Date:** 2026-04-10
**Status:** Approved

## Overview

Three changes across the lead/contact/reservation forms:
1. Update privacy and marketing consent checkbox copy to match Nissan standard wording
2. Add consent checkboxes to the reservation form and pass them to n8n
3. Add a Stripe security badge to the reservation form
4. Fix reservation deposit amount from 250€ to 300€ in the FAQ

## Affected Files

| File | Change |
|------|--------|
| `src/components/sections/InfoFormSection.tsx` | Update checkbox copy |
| `src/components/forms/ContactForm.tsx` | Update privacy copy, add marketing checkbox |
| `src/components/forms/StripePaymentForm.tsx` | Add consent checkboxes, add Stripe badge |
| `src/types/index.ts` | Add `privacyConsent` + `marketingConsent` to `LeadFormData` |
| `src/app/api/leads/route.ts` | Forward `privacyConsent` + `marketingConsent` to n8n |

## Section 1 — Checkbox Copy (InfoFormSection + ContactForm)

### Privacy checkbox (required)
```
Li e aceito a <strong><a href="/politica-de-privacidade">Política de Privacidade.</a></strong>
```

### Marketing checkbox (optional)
```
Gostaria de receber comunicações de marketing, nomeadamente promoções, eventos, novos
produtos e serviços Nissan, seja através de e-mail, telefone ou SMS e no veículo (se
suportado), por forma a personalizar e a melhorar a minha experiência enquanto cliente.
```

`ContactForm.tsx` currently only has the old privacy checkbox — the marketing checkbox must be added.

## Section 2 — Reservation Form Consent Fields

- Add `privacyConsent` (boolean, required) and `marketingConsent` (boolean, optional) state fields to `CardElementForm` in `StripePaymentForm.tsx`
- Render both consent checkboxes (same copy as above, light-theme styling: `text-[#6B6B6B]`) just before the submit button
- Include both fields in the Step 3 n8n payload sent to `/api/reservation-complete`
- `reservation-complete/route.ts` already forwards the full payload to n8n — no changes needed there

## Section 3 — Stripe Security Badge

Placed between the CardElement and the submit button. Inline flex row:

```
🔒 (SVG lock) | "Pagamento seguro" | Stripe wordmark SVG | Visa SVG | Mastercard SVG
```

- Style: `flex items-center gap-2 justify-center text-xs text-[#6B6B6B]`
- Icons at 16–24px height, all inline SVG (no external image deps)

## Section 4 — Copy Fix: 300€

- `InfoFormSection.tsx` FAQ answer for "Quanto custa fazer uma reserva?" currently says "250 €" — change to "300 €"
- Submit button in `StripePaymentForm.tsx` already reads "Reservar agora — €300" — no change needed

## Type Changes

```ts
// src/types/index.ts — LeadFormData
export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
  privacyConsent: boolean        // add
  marketingConsent?: boolean     // add
}
```

## API Changes

`/api/leads/route.ts` — add `privacyConsent` and `marketingConsent` to:
1. The required-fields validation check (privacyConsent required, marketingConsent optional)
2. The n8n webhook payload

## Non-Changes

- `reservation-complete/route.ts` — no changes, already forwards full payload
- `contact/route.ts` — no changes, already handles both consent fields
- No new components or files created
