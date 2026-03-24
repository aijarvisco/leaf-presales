# Stripe Billing Fields — Design Spec

**Date:** 2026-03-24
**Status:** Approved

## Summary

Add name, billing address, and TAX ID fields to the Stripe payment form. All data is stored in Stripe: name and address go into the PaymentMethod's `billing_details`; TAX ID goes into the PaymentIntent metadata.

## Form Layout

Fields appear above the `CardElement` in this order:

1. Full name
2. Street address (line1)
3. City + Postal code (side by side)
4. Country (defaults to `PT`)
5. TAX ID (NIF / NIPC — no validation)
6. CardElement (unchanged)
7. Submit button (unchanged)

All custom inputs are plain `<input>` elements styled to match the existing dark theme (same border, background, and text colours as the CardElement wrapper). All fields are `required`. No client-side format validation.

## Data Flow

On form submit:

1. Extract PaymentIntent ID from `clientSecret`: `clientSecret.split('_secret_')[0]`
2. `POST /api/payment-intent/update` with `{ intentId, taxId, name, line1, city, postalCode, country }` — updates PI metadata server-side via `stripe.paymentIntents.update`
3. If update fails → show error, abort (do not call `confirmCardPayment`)
4. `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement, billing_details: { name, address: { line1, city, postal_code, postalCode, country } } } })`
5. On success → redirect to `/obrigado` (unchanged)
6. On Stripe error → show error message, re-enable submit button

## Files Changed

### `src/components/forms/StripePaymentForm.tsx`

- `CardElementForm` gains state for: `name`, `line1`, `city`, `postalCode`, `country`
- `handleSubmit` updated to: extract PI ID → call update endpoint → call `confirmCardPayment`
- 5 new `<input>` fields rendered above `CardElement`

### `src/app/api/payment-intent/update/route.ts` (new)

- `POST` handler
- Accepts: `{ intentId, taxId, name, line1, city, postalCode, country }`
- Calls `stripe.paymentIntents.update(intentId, { metadata: { taxId, name, line1, city, postalCode, country } })`
- Returns `{ ok: true }` on success, `{ error: '...' }` with status 500 on failure

## Out of Scope

- TAX ID format validation (NIF/NIPC)
- Stripe Customer creation
- Phone number field
- State/region field
