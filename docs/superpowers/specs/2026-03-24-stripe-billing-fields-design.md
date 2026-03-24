# Stripe Billing Fields — Design Spec

**Date:** 2026-03-24
**Status:** Approved

## Summary

Add name, billing address, and TAX ID fields to the Stripe payment form. All data is stored in Stripe: name and address go into the PaymentMethod's `billing_details` via `confirmCardPayment`; TAX ID goes into the PaymentIntent metadata via a separate update call before confirmation.

## Form Layout

Fields appear above the `CardElement` in this order:

1. Full name
2. Street address (line1)
3. City + Postal code (side by side)
4. Country (defaults to `PT`) — rendered as a `<select>` with a curated list of EU member states plus a few neighbouring countries (PT, ES, FR, DE, IT, NL, BE, AT, IE, GB, CH). Full ISO 3166-1 is not needed; the list is hardcoded in the component.
5. TAX ID (NIF / NIPC — no validation, free text)
6. CardElement (unchanged)
7. Submit button (unchanged)

All custom inputs/selects are styled to match the existing dark theme (same border, background, and text colours as the CardElement wrapper). All fields are `required`.

## Data Flow

The submit button is disabled immediately on the first click, before the async chain begins, and remains disabled for the entire chain (update + confirm).

On form submit:

1. Disable submit button
2. `POST /api/payment-intent/update` with `{ clientSecret, taxId }` — the server derives `intentId` from `clientSecret` (`clientSecret.split('_secret_')[0]`) and stores only `taxId` in the PI metadata. Name and address are not stored here as they will be sent natively to Stripe via `billing_details` in the next step.
   - Authorization: possession of `clientSecret` is used as the proof of ownership (accepted risk — a leaked `clientSecret` would allow overwriting the TAX ID field; no additional auth layer is added for this pre-sales context).
3. If update fails (non-2xx `response.ok`) → show error, re-enable button, abort
4. `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement, billing_details: { name, address: { line1, city, postal_code: postalCode, country } } } })`
5. On success → redirect to `/obrigado` (unchanged)
6. On Stripe error object → show error message, re-enable submit button
7. On thrown exception (network failure, etc.) → show generic error message, re-enable submit button

## Files Changed

### `src/components/forms/StripePaymentForm.tsx`

- `CardElementForm` gains state for: `name`, `line1`, `city`, `postalCode`, `country`, `taxId`
- `handleSubmit` updated to: disable button → call update endpoint (with `clientSecret` + `taxId`) → call `confirmCardPayment` (with billing_details), with full error handling for both steps
- 5 new fields rendered above `CardElement`: text inputs for name, line1, city, postalCode, taxId; `<select>` for country (hardcoded list: PT, ES, FR, DE, IT, NL, BE, AT, IE, GB, CH)

### `src/app/api/payment-intent/update/route.ts` (new)

- Exports only `POST` (no `GET`) to prevent accidental exposure via browser prefetch
- Accepts: `{ clientSecret, taxId }`
- Derives `intentId` server-side: `clientSecret.split('_secret_')[0]`
- Calls `stripe.paymentIntents.update(intentId, { metadata: { taxId } })`
- Returns `{ ok: true }` on success
- Returns `{ error: 'Failed to update payment intent' }` with HTTP 500 on failure; client checks `response.ok`

## Out of Scope

- TAX ID format validation (NIF/NIPC)
- Stripe Customer creation
- Phone number field
- State/region field
