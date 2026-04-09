# Reservation Form Fields & Post-Payment Dispatch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the reservation form to collect email, phone, district, and concessionário; remove the country field; and dispatch the full reservation payload to Stripe metadata and an n8n webhook after successful payment.

**Architecture:** The form fields are added directly to `StripePaymentForm`'s inner `CardElementForm` component alongside the existing billing fields. After `confirmCardPayment` succeeds, the client POSTs to a new internal Next.js route `/api/reservation-complete` which calls the n8n webhook (URL from env). The PI metadata update call (Step 1 in the payment flow) is extended to persist all new fields to Stripe.

**Tech Stack:** Next.js App Router, Stripe.js, `@stripe/react-stripe-js`, `concessionarios.json` (existing dealer data)

---

## File Map

| Status | File | Change |
|--------|------|--------|
| Modify | `src/app/api/payment-intent/update/route.ts` | Accept and store new metadata fields |
| Create | `src/app/api/reservation-complete/route.ts` | Call n8n webhook, return `{ ok: true }` |
| Modify | `src/components/forms/StripePaymentForm.tsx` | New fields, removed country, updated submit |
| Modify | `src/components/ui/ReservationDrawer.tsx` | Pass vehicle props to StripePaymentForm |

---

## Task 1: Extend PI metadata update route

**Files:**
- Modify: `src/app/api/payment-intent/update/route.ts`

- [ ] **Step 1: Replace file contents**

```ts
// src/app/api/payment-intent/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { clientSecret, taxId, distrito, concessionarioId, email, phone } =
      await req.json() as {
        clientSecret: string
        taxId: string
        distrito: string
        concessionarioId: string
        email: string
        phone: string
      }
    const intentId = clientSecret.split('_secret_')[0]

    await stripe.paymentIntents.update(intentId, {
      metadata: { taxId, distrito, concessionarioId, email, phone },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update payment intent' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify with curl (dev server must be running)**

```bash
curl -s -X POST http://localhost:3000/api/payment-intent/update \
  -H "Content-Type: application/json" \
  -d '{"clientSecret":"fake","taxId":"123","distrito":"Lisboa","concessionarioId":"abc","email":"a@b.com","phone":"912345678"}' | jq .
```

Expected: `{"error":"Failed to update payment intent"}` (fake secret hits the catch — that's correct)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payment-intent/update/route.ts
git commit -m "feat: extend PI metadata update with distrito, concessionarioId, email, phone"
```

---

## Task 2: Create `/api/reservation-complete` route

**Files:**
- Create: `src/app/api/reservation-complete/route.ts`

- [ ] **Step 1: Create the file**

```ts
// src/app/api/reservation-complete/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      console.warn('[reservation-complete] N8N_WEBHOOK_URL is not set — skipping webhook')
      return NextResponse.json({ ok: true })
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (webhookErr) {
      console.error('[reservation-complete] n8n webhook failed:', webhookErr)
      // payment already captured — do not block the user
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify the route exists and responds (dev server running)**

```bash
curl -s -X POST http://localhost:3000/api/reservation-complete \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com"}' | jq .
```

Expected: `{"ok":true}` (N8N_WEBHOOK_URL not set in dev → warn + return ok)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reservation-complete/route.ts
git commit -m "feat: add reservation-complete route for n8n webhook dispatch"
```

---

## Task 3: Update `StripePaymentForm` — new fields, remove country, updated submit

**Files:**
- Modify: `src/components/forms/StripePaymentForm.tsx`

This is the main change. Replace the entire file with the version below.

Key changes vs current:
- `Props` gains `versionName`, `colorName`, `colorHex`, `price`
- `CardElementForm` receives all vehicle props
- `COUNTRIES` constant and `country` state removed — hardcoded `'PT'`
- New state: `email`, `phone`, `distrito`, `concessionarioId`, `concessionarioName`, `dealers`
- New `selectClass` for select elements
- District/concessionário data pulled from `@/data/concessionarios.json` (same as `InfoFormSection`)
- Form fields reordered per spec
- Submit: metadata update now includes new fields; `billing_details` includes email/phone; on success fires `/api/reservation-complete` before redirecting

- [ ] **Step 1: Replace file contents**

```tsx
// src/components/forms/StripePaymentForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import Button from '@/components/ui/Button'
import type { StripeError } from '@stripe/stripe-js'
import dealersData from '@/data/concessionarios.json'

// ─── Dealer helpers (same logic as InfoFormSection) ───────────────────────────

interface Dealer {
  designation: string
  objectId: string
  address: string
}

const districts = dealersData
  .map((d) => d.district)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, 'pt'))

function getDealers(district: string): Dealer[] {
  const found = dealersData.find((d) => d.district === district)
  if (!found) return []
  return (found.dealers as Dealer[]).filter((d) => d.address !== 'GRUPO')
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-[#D1D1D1] bg-white px-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#A1A1A1] focus:border-[#0070C9] focus:outline-none'

const selectClass =
  'w-full rounded-lg border border-[#D1D1D1] bg-white px-4 py-2.5 text-sm text-[#0A0A0A] focus:border-[#0070C9] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  versionId?: string
  versionName?: string
  colorName?: string
  colorHex?: string
  price?: number
}

// ─── StripePaymentForm (outer — fetches client secret) ────────────────────────

export default function StripePaymentForm({ versionId, versionName, colorName, colorHex, price }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)

  const load = () => {
    setFetchError(false)
    setClientSecret(null)
    fetch('/api/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId }),
    })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data) => setClientSecret(data.clientSecret))
      .catch(() => setFetchError(true))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (fetchError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">Não foi possível carregar o formulário de pagamento.</p>
        <Button variant="ghost" onClick={load}>Tentar novamente</Button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div data-testid="payment-form-skeleton" className="space-y-3 animate-pulse">
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-10 rounded-lg bg-gray-100" />
        <div className="h-11 rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardElementForm
        clientSecret={clientSecret}
        versionId={versionId}
        versionName={versionName}
        colorName={colorName}
        colorHex={colorHex}
        price={price}
      />
    </Elements>
  )
}

// ─── CardElementForm (inner — handles form state and submission) ──────────────

function CardElementForm({
  clientSecret,
  versionId,
  versionName,
  colorName,
  colorHex,
  price,
}: {
  clientSecret: string
  versionId?: string
  versionName?: string
  colorName?: string
  colorHex?: string
  price?: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Billing
  const [name, setName] = useState('')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [taxId, setTaxId] = useState('')

  // Contact (new)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Dealer (new)
  const [distrito, setDistrito] = useState('')
  const [concessionarioId, setConcessionarioId] = useState('')
  const [concessionarioName, setConcessionarioName] = useState('')
  const [dealers, setDealers] = useState<Dealer[]>([])

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value
    setDistrito(district)
    setConcessionarioId('')
    setConcessionarioName('')
    setDealers(getDealers(district))
  }

  const handleConcessionarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setConcessionarioId(id)
    const dealer = dealers.find((d) => d.objectId === id)
    setConcessionarioName(dealer ? `${dealer.designation} - ${dealer.address}` : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: persist all extra fields in PI metadata
      const updateRes = await fetch('/api/payment-intent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSecret, taxId, distrito, concessionarioId, email, phone }),
      })
      if (!updateRes.ok) {
        setError('Ocorreu um erro. Tenta novamente.')
        setSubmitting(false)
        return
      }

      // Step 2: confirm payment with full billing details
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) { setSubmitting(false); return }

      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              email,
              phone,
              address: { line1, city, postal_code: postalCode, country: 'PT' },
            },
          },
        },
      ) as { error: StripeError | null }

      if (stripeError) {
        setError(stripeError.message ?? 'Ocorreu um erro. Tenta novamente.')
        setSubmitting(false)
        return
      }

      // Step 3: dispatch to n8n via internal route (fire and continue)
      await fetch('/api/reservation-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          distrito, concessionarioId, concessionarioName,
          line1, city, postalCode, country: 'PT', taxId,
          versionId, versionName, colorName, colorHex, price,
        }),
      })

      window.location.href = window.location.origin + '/obrigado'
    } catch {
      setError('Ocorreu um erro. Tenta novamente.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 1. Nome completo */}
      <div>
        <label htmlFor="billing-name" className="mb-1 block text-xs text-[#6B6B6B]">Nome completo</label>
        <input
          id="billing-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="João Silva"
          className={inputClass}
        />
      </div>

      {/* 2. Email */}
      <div>
        <label htmlFor="billing-email" className="mb-1 block text-xs text-[#6B6B6B]">Email</label>
        <input
          id="billing-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="joao@email.com"
          className={inputClass}
        />
      </div>

      {/* 3. Telemóvel */}
      <div>
        <label htmlFor="billing-phone" className="mb-1 block text-xs text-[#6B6B6B]">Telemóvel</label>
        <input
          id="billing-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="912 345 678"
          className={inputClass}
        />
      </div>

      {/* 4. Distrito */}
      <div>
        <label htmlFor="billing-distrito" className="mb-1 block text-xs text-[#6B6B6B]">Distrito</label>
        <select
          id="billing-distrito"
          required
          value={distrito}
          onChange={handleDistrictChange}
          className={selectClass}
        >
          <option value="">Selecione um distrito</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* 5. Concessionário */}
      <div>
        <label htmlFor="billing-concessionario" className="mb-1 block text-xs text-[#6B6B6B]">Concessionário</label>
        <select
          id="billing-concessionario"
          required
          value={concessionarioId}
          onChange={handleConcessionarioChange}
          disabled={!distrito}
          className={selectClass}
        >
          <option value="">Selecione um concessionário</option>
          {dealers.map((d) => (
            <option key={d.objectId} value={d.objectId}>{d.designation} - {d.address}</option>
          ))}
        </select>
      </div>

      {/* 6. Morada */}
      <div>
        <label htmlFor="billing-line1" className="mb-1 block text-xs text-[#6B6B6B]">Morada</label>
        <input
          id="billing-line1"
          type="text"
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="Rua das Flores, 1"
          className={inputClass}
        />
      </div>

      {/* 7. Cidade + Código postal */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="billing-city" className="mb-1 block text-xs text-[#6B6B6B]">Cidade</label>
          <input
            id="billing-city"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Lisboa"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="billing-postal" className="mb-1 block text-xs text-[#6B6B6B]">Código postal</label>
          <input
            id="billing-postal"
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="1000-001"
            className={inputClass}
          />
        </div>
      </div>

      {/* 8. NIF / NIPC */}
      <div>
        <label htmlFor="billing-taxid" className="mb-1 block text-xs text-[#6B6B6B]">NIF / NIPC</label>
        <input
          id="billing-taxid"
          type="text"
          required
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="123456789"
          className={inputClass}
        />
      </div>

      {/* 9. Card element */}
      <div className="rounded-lg border border-[#D1D1D1] bg-white px-4 py-3">
        <CardElement options={cardElementStyle} />
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <Button type="submit" variant="primary" className="w-full" disabled={submitting || !stripe || !elements}>
        {submitting ? 'A processar...' : 'Reservar agora — €300'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Verify the dev server compiles with no errors**

```bash
# In a terminal running the dev server, check for TypeScript/build errors
# Look for red output. Expected: no errors, page reloads cleanly.
```

- [ ] **Step 3: Open the reservation drawer in the browser and verify**

- Country field is gone
- Email, Telemóvel, Distrito, Concessionário fields appear in order
- Selecting a district populates the concessionário list
- Concessionário select is disabled until district is chosen

- [ ] **Step 4: Commit**

```bash
git add src/components/forms/StripePaymentForm.tsx
git commit -m "feat: add email, phone, district, concessionario to reservation form; remove country field"
```

---

## Task 4: Pass vehicle props from `ReservationDrawer` to `StripePaymentForm`

**Files:**
- Modify: `src/components/ui/ReservationDrawer.tsx`

- [ ] **Step 1: Update the `StripePaymentForm` call inside the drawer body**

Find this block in `ReservationDrawer.tsx` (around line 119):

```tsx
{isOpen && <StripePaymentForm versionId={versionId} />}
```

Replace with:

```tsx
{isOpen && (
  <StripePaymentForm
    versionId={versionId}
    versionName={versionName}
    colorName={colorName}
    colorHex={colorHex}
    price={price}
  />
)}
```

- [ ] **Step 2: Verify in browser**

Open the reservation drawer. After filling all fields and paying (use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC), confirm redirect to `/obrigado`. Check the Next.js terminal for the `[reservation-complete] N8N_WEBHOOK_URL is not set` warning (expected in dev).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ReservationDrawer.tsx
git commit -m "feat: pass vehicle props to StripePaymentForm for n8n payload"
```

---

## Task 5: Add `N8N_WEBHOOK_URL` to env example

**Files:**
- Modify: `.env.example` (or `.env.local.example` — whichever exists in the project)

- [ ] **Step 1: Check which env example file exists**

```bash
ls .env* 2>/dev/null
```

- [ ] **Step 2: Add the variable to the env example file**

Add this line:

```
N8N_WEBHOOK_URL=           # Full URL of the n8n webhook. Leave empty to skip during dev.
```

- [ ] **Step 3: Commit**

```bash
git add .env.example   # or .env.local.example — use whichever file you found
git commit -m "chore: document N8N_WEBHOOK_URL env variable"
```
