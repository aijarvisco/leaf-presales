# Reservar Section — Embedded Stripe Payment Element

**Date:** 2026-03-24
**Status:** Approved

## Overview

Replace the "Reservar agora" redirect button in `CTASection` with an embedded Stripe Payment Element rendered directly in the page. The user fills in card details inline and is redirected to `/obrigado` on success. The ContactForm column is untouched.

## Architecture & Data Flow

1. `CTASection` mounts → calls `POST /api/payment-intent` → receives `{ clientSecret }`
2. `clientSecret` is passed to Stripe's `<Elements>` provider
3. User fills in the `<PaymentElement>` and clicks submit
4. `stripe.confirmPayment()` is called with `return_url: /obrigado`
5. On success, Stripe redirects to `/obrigado?payment_intent=...` (existing page, no changes needed)

The existing `/api/checkout` route and `ContactForm` are not modified.

## New Files

### `src/app/api/payment-intent/route.ts`
- `POST` handler
- Creates a Stripe `PaymentIntent` for `€300` (`amount: 30000, currency: 'eur'`)
- Accepts optional `versionId` in request body, stores it in `metadata`
- Returns `{ clientSecret: paymentIntent.client_secret }`

### `src/components/forms/StripePaymentForm.tsx`
- `'use client'` component
- On mount: fetches `clientSecret` from `/api/payment-intent`, passing `versionId` prop
- While fetching: renders a loading skeleton (same height as the form, subtle pulse)
- Once `clientSecret` is ready: renders `<Elements stripe={stripePromise} options={{ clientSecret, appearance }}>`
  - Inside: `<PaymentElementForm />` — inner component that uses `useStripe` / `useElements` hooks
  - `<PaymentElement />` — Stripe's unified payment UI
  - Submit button: `"Reservar agora — €300"` with loading/disabled states
  - Error state: inline error message below the button
- On submit: calls `stripe.confirmPayment({ elements, confirmParams: { return_url } })`

## Modified Files

### `src/components/sections/CTASection.tsx`
- Remove `handleReserve` function and the redirect button
- Replace the button + note area with `<StripePaymentForm versionId={selectedVersion} />`
- Keep heading, description, and security note (`🔒`) unchanged

## Stripe Theming

```ts
appearance: {
  theme: 'night',
  variables: {
    colorBackground: '#1A1A1A',   // --color-card
    colorText: '#FFFFFF',          // --color-text-primary
    colorTextSecondary: '#A1A1A1', // --color-text-secondary
    colorPrimary: '#0070C9',       // --color-accent
    colorDanger: '#f87171',
    borderRadius: '8px',
    fontSizeBase: '14px',
  },
}
```

## Dependencies

- Install `@stripe/react-stripe-js` (peer of already-installed `@stripe/stripe-js`)
- Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var (used to initialise `loadStripe` on the client)

## Environment Variables

| Variable | Where used |
|---|---|
| `STRIPE_SECRET_KEY` | Already used in `src/lib/stripe.ts` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | New — `loadStripe(...)` in client component |

## Error Handling

- If `/api/payment-intent` fails: show an error message in place of the form with a retry button
- If `stripe.confirmPayment` returns an error: display `error.message` below the submit button
- Submit button is disabled while payment is being confirmed

## What Is Not Changing

- `/api/checkout` route (kept for potential future use)
- `ContactForm` and the right column of `CTASection`
- `/obrigado` page and `ObrigadoContent`
- All other sections
