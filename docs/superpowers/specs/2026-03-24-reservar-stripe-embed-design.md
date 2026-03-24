# Reservar Section — Embedded Stripe Payment Element

**Date:** 2026-03-24
**Status:** Approved

## Overview

Replace the "Reservar agora" redirect button in `CTASection` with an embedded Stripe Payment Element rendered directly in the page. The user fills in card details inline and is redirected to `/obrigado` on success. The ContactForm column is untouched.

## Architecture & Data Flow

1. `CTASection` mounts → calls `POST /api/payment-intent` → receives `{ clientSecret }`
2. `clientSecret` is passed to Stripe's `<Elements>` provider
3. User fills in the `<PaymentElement>` and clicks submit
4. `stripe.confirmPayment()` is called with `return_url: window.location.origin + '/obrigado'` (absolute URL, required by Stripe SDK)
5. On success, Stripe redirects to `/obrigado?payment_intent=pi_xxx&redirect_status=succeeded`
6. `ObrigadoContent` detects `?payment_intent=`, fetches `/api/payment-intent/retrieve?id=pi_xxx`, and renders order details

The existing `/api/checkout` route and `ContactForm` are not modified.

## New Files

### `src/lib/stripe-client.ts`
- Exports `const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)`
- Called once at module level (outside any component) to prevent re-instantiation and Payment Element flicker
- Imported by `StripePaymentForm`

### `src/app/api/payment-intent/route.ts`
- `POST` handler
- Creates a Stripe `PaymentIntent` for €300 (`amount: 30000, currency: 'eur'`)
- Accepts optional `versionId` in request body, stored in `metadata`
- Returns `{ clientSecret: paymentIntent.client_secret }`
- Note: a PaymentIntent is created on every component mount (every page load). This is acceptable for a low-traffic presales page. No idempotency key is used.

### `src/app/api/payment-intent/retrieve/route.ts`
- `GET` handler, accepts `?id=pi_xxx`
- Retrieves the PaymentIntent with `latest_charge` expanded
- Returns `{ email, amount, paymentIntentId }` — same shape as `/api/checkout/session` so `ObrigadoContent` can reuse it unchanged
- `email` comes from `charge.billing_details.email` — this is populated because `<PaymentElement>` is configured to always collect email (see `StripePaymentForm` below)
- `amount` formatted as `€X.XX`

### `src/components/forms/StripePaymentForm.tsx`
- `'use client'` component, accepts `versionId?: string` prop
- On mount: fetches `clientSecret` from `/api/payment-intent`
- While fetching: renders a loading skeleton (same height as the form, subtle pulse animation)
- On fetch error: renders an error message with a retry button
- Once `clientSecret` is ready: renders `<Elements stripe={stripePromise} options={{ clientSecret, appearance }}>`
  - Inner component `<PaymentElementForm />` uses `useStripe` / `useElements` hooks
  - `<PaymentElement options={{ fields: { billingDetails: { email: 'always' } } }} />` — configured to always collect email so the order confirmation can display it
  - Submit button: `"Reservar agora — €300"`, disabled while confirming
  - On submit: calls `stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.origin + '/obrigado' } })`
  - On error: displays `error.message` inline below the button

## Modified Files

### `src/components/sections/CTASection.tsx`
- Remove `handleReserve`, `loading` state, and the redirect button
- Replace button area with `<StripePaymentForm versionId={selectedVersion} />`
- Keep heading, description, and `🔒` security note (placed below `<StripePaymentForm />`)

### `src/app/obrigado/ObrigadoContent.tsx`
- Read both `params.get('session_id')` and `params.get('payment_intent')` from the URL
- **Replace** the existing guard `if (!sessionId) return` with `if (!sessionId && !paymentIntentId) return` so the payment_intent branch is not dead code
- If `session_id` present: fetch `/api/checkout/session?id=...` (existing behaviour, unchanged)
- If `payment_intent` present: fetch `/api/payment-intent/retrieve?id=...`
- Either way, result is set into the same `order` state — the render block is unchanged

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
- Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var

## Environment Variables

| Variable | Where used |
|---|---|
| `STRIPE_SECRET_KEY` | Already in `src/lib/stripe.ts` (server) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | New — `src/lib/stripe-client.ts` (client) |

## Error Handling

| Scenario | Behaviour |
|---|---|
| `/api/payment-intent` fails on mount | Error message + retry button replaces the form |
| `stripe.confirmPayment` returns error | `error.message` shown inline below submit button |
| Submit while confirming | Button disabled |
| `/api/payment-intent/retrieve` fails on `/obrigado` | Order details block silently omitted (same as current behaviour when session fetch fails) |

## What Is Not Changing

- `/api/checkout` route (kept for potential future use)
- `ContactForm` and the right column of `CTASection`
- The `/obrigado` page render block (only the data-fetching logic changes)
- All other sections
