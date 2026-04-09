# Reservation Form — New Fields & Post-Payment Dispatch

**Date:** 2026-04-09
**Status:** Approved

---

## Overview

Update `StripePaymentForm` to collect district, concessionário, email, and phone — removing the country field (hardcoded to Portugal). On successful payment, dispatch the full reservation payload to both Stripe PI metadata and an n8n webhook via an internal Next.js API route.

---

## Form Changes

### Removed
- **País** (country select) — hardcoded to `'PT'` in `billing_details`; the `COUNTRIES` constant and its state are deleted

### Added
- **Email** — text input, type `email`, required — maps to `billing_details.email`
- **Telemóvel** — text input, type `tel`, required — maps to `billing_details.phone`
- **Distrito** — select populated from `concessionarios.json` (same data source as `InfoFormSection`), required — resets concessionário when changed
- **Concessionário** — select filtered by selected district, disabled until district is chosen, stores `objectId` as value and displays `designation - address`, required

### Field order in form

1. Nome completo
2. Email *(new)*
3. Telemóvel *(new)*
4. Distrito *(new)*
5. Concessionário *(new)*
6. Morada
7. Cidade + Código postal (grid)
8. NIF / NIPC
9. Card element

---

## Data Flow

### Step 1 — Metadata update (extended)

`POST /api/payment-intent/update` — already called before `confirmCardPayment`. Extended to include all extra fields:

```ts
{ clientSecret, taxId, distrito, concessionarioId, email, phone }
```

Stripe PI metadata receives: `taxId`, `distrito`, `concessionarioId`, `email`, `phone`.

### Step 2 — Confirm payment

`stripe.confirmCardPayment` — billing details now include email and phone:

```ts
billing_details: {
  name,
  email,
  phone,
  address: { line1, city, postal_code: postalCode, country: 'PT' },
}
```

### Step 3 — Post-payment dispatch (new)

On successful confirmation, the client POSTs to `/api/reservation-complete` with the full payload:

```ts
{
  // Contact
  name, email, phone,
  // Dealer
  distrito, concessionarioId, concessionarioName,
  // Billing
  line1, city, postalCode, country: 'PT', taxId,
  // Vehicle
  versionId, versionName, colorName, colorHex, price,
}
```

`/api/reservation-complete`:
1. Calls `N8N_WEBHOOK_URL` (env var) via `fetch` with the full payload
2. n8n call is non-blocking for the redirect — if it fails, log the error and continue
3. Returns `{ ok: true }` — client redirects to `/obrigado`

---

## Props change — `StripePaymentForm`

Currently only receives `versionId`. Must be extended to also receive `versionName`, `colorName`, `colorHex`, `price` so the full vehicle context is included in the n8n payload. `ReservationDrawer` already has all these values and passes them to `StripePaymentForm`.

---

## New files

| File | Purpose |
|------|---------|
| `src/app/api/reservation-complete/route.ts` | Calls n8n webhook, returns `{ ok: true }` |

## Modified files

| File | Changes |
|------|---------|
| `src/components/forms/StripePaymentForm.tsx` | New fields, removed country, extended submit flow |
| `src/components/ui/ReservationDrawer.tsx` | Pass extra props to `StripePaymentForm` |
| `src/app/api/payment-intent/update/route.ts` | Accept and store new metadata fields |

---

## Environment variables

| Var | Description |
|-----|-------------|
| `N8N_WEBHOOK_URL` | Full URL of the n8n webhook endpoint. If unset, the webhook step is skipped (log warning). |

---

## Error handling

- If PI metadata update fails → abort payment (existing behaviour)
- If `confirmCardPayment` fails → show Stripe error (existing behaviour)
- If n8n webhook fails → log error, still redirect to `/obrigado` (payment already captured)
- If `N8N_WEBHOOK_URL` is unset → log warning, skip webhook, redirect normally
