# Stripe Billing Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add name, billing address (line1, city, postal code, country), and TAX ID fields to the Stripe payment form, storing them in Stripe via `billing_details` on the PaymentMethod and `metadata` on the PaymentIntent.

**Architecture:** A new `/api/payment-intent/update` route stores the TAX ID in PaymentIntent metadata before confirmation. The existing `confirmCardPayment` call is extended with `billing_details` carrying name and address. The form fields are plain styled inputs rendered above the existing `CardElement`.

**Tech Stack:** Next.js App Router, TypeScript, Stripe Node SDK (`@/lib/stripe`), `@stripe/react-stripe-js`, Tailwind CSS, Jest + React Testing Library.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/payment-intent/update/route.ts` | Accept `clientSecret` + `taxId`, update PI metadata server-side |
| Modify | `src/components/forms/StripePaymentForm.tsx` | Add 6 billing fields, two-step submit flow |
| Create | `tests/api/payment-intent-update.test.ts` | Unit tests for the new route |
| Modify | `tests/components/forms/StripePaymentForm.test.tsx` | Fix stale mocks, add billing field tests |

---

### Task 1: Create `/api/payment-intent/update` route

**Files:**
- Create: `src/app/api/payment-intent/update/route.ts`
- Create: `tests/api/payment-intent-update.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/api/payment-intent-update.test.ts`:

```typescript
/**
 * @jest-environment node
 */
// tests/api/payment-intent-update.test.ts
import { POST } from '@/app/api/payment-intent/update/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      update: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockUpdate = stripe.paymentIntents.update as jest.Mock

describe('POST /api/payment-intent/update', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('updates PI metadata with taxId and returns ok', async () => {
    mockUpdate.mockResolvedValueOnce({})
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_abc123_secret_xyz', taxId: '123456789' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith('pi_abc123', { metadata: { taxId: '123456789' } })
  })

  it('derives intentId correctly from clientSecret', async () => {
    mockUpdate.mockResolvedValueOnce({})
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_3Pxyz_secret_abc', taxId: 'PT123' }),
    })
    await POST(req)
    expect(mockUpdate).toHaveBeenCalledWith('pi_3Pxyz', expect.anything())
  })

  it('returns 500 when Stripe throws', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_abc_secret_xyz', taxId: '123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Failed to update payment intent')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npx jest tests/api/payment-intent-update.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/payment-intent/update/route'`

- [ ] **Step 3: Create the route**

Create `src/app/api/payment-intent/update/route.ts`:

```typescript
// src/app/api/payment-intent/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { clientSecret, taxId } = await req.json() as { clientSecret: string; taxId: string }
    const intentId = clientSecret.split('_secret_')[0]

    await stripe.paymentIntents.update(intentId, { metadata: { taxId } })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update payment intent' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest tests/api/payment-intent-update.test.ts --no-coverage
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payment-intent/update/route.ts tests/api/payment-intent-update.test.ts
git commit -m "feat: add /api/payment-intent/update route to store TAX ID in PI metadata"
```

---

### Task 2: Update `StripePaymentForm` with billing fields

**Files:**
- Modify: `src/components/forms/StripePaymentForm.tsx`
- Modify: `tests/components/forms/StripePaymentForm.test.tsx`

#### 2a — Fix stale tests first

The existing test file still mocks `PaymentElement` and `confirmPayment`, but the component now uses `CardElement` and `confirmCardPayment`. Fix the tests before touching the component so we have a green baseline.

- [ ] **Step 1: Rewrite the test file**

Replace the full contents of `tests/components/forms/StripePaymentForm.test.tsx`:

```typescript
// tests/components/forms/StripePaymentForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

const mockConfirmCardPayment = jest.fn()
const mockGetElement = jest.fn(() => ({})) // returns a fake card element

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({ confirmCardPayment: mockConfirmCardPayment }),
  useElements: () => ({ getElement: mockGetElement }),
}))

jest.mock('@/lib/stripe-client', () => ({ stripePromise: Promise.resolve(null) }))

const mockFetch = jest.fn()
global.fetch = mockFetch

// clientSecret used across tests — intentId derived from the prefix before _secret_
const CLIENT_SECRET = 'pi_test123_secret_xyz'

describe('StripePaymentForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows a loading skeleton while fetching clientSecret', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<StripePaymentForm />)
    expect(screen.getByTestId('payment-form-skeleton')).toBeInTheDocument()
  })

  it('renders billing fields and card element after fetching clientSecret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByTestId('card-element')).toBeInTheDocument())
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Morada/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Cidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Código postal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/País/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIF \/ NIPC/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reservar agora/i })).toBeInTheDocument()
  })

  it('shows error state with retry button when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument())
  })

  it('calls update endpoint then confirmCardPayment with billing details on submit', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) }) // PI creation
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // update endpoint
    mockConfirmCardPayment.mockResolvedValueOnce({ error: null })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByLabelText(/Cidade/i), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))

    // Second fetch is the update endpoint
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/api/payment-intent/update',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ clientSecret: CLIENT_SECRET, taxId: '123456789' }),
      }),
    )

    // confirmCardPayment receives billing_details
    expect(mockConfirmCardPayment).toHaveBeenCalledWith(
      CLIENT_SECRET,
      expect.objectContaining({
        payment_method: expect.objectContaining({
          billing_details: expect.objectContaining({
            name: 'João Silva',
            address: expect.objectContaining({
              line1: 'Rua das Flores 1',
              city: 'Lisboa',
              postal_code: '1000-001',
            }),
          }),
        }),
      }),
    )
  })

  it('shows error and re-enables button if update endpoint fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: false })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByLabelText(/Cidade/i), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(mockConfirmCardPayment).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Reservar agora/i })).not.toBeDisabled()
  })

  it('shows Stripe error message and re-enables button when confirmCardPayment fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
    mockConfirmCardPayment.mockResolvedValueOnce({ error: { message: 'O teu cartão foi recusado.' } })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByLabelText(/Cidade/i), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(screen.getByText('O teu cartão foi recusado.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Reservar agora/i })).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to see current failures**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: Some tests fail (the form doesn't have billing fields yet). Note how many pass and which fail — that's your baseline.

- [ ] **Step 3: Update `StripePaymentForm.tsx`**

Replace the full contents of `src/components/forms/StripePaymentForm.tsx`:

```typescript
// src/components/forms/StripePaymentForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import Button from '@/components/ui/Button'
import type { StripeError } from '@stripe/stripe-js'

const appearance = {
  theme: 'night' as const,
  variables: {
    colorBackground: '#1A1A1A',
    colorText: '#FFFFFF',
    colorTextSecondary: '#A1A1A1',
    colorPrimary: '#0070C9',
    colorDanger: '#f87171',
    borderRadius: '8px',
    fontSizeBase: '14px',
  },
}

const COUNTRIES = [
  { code: 'PT', label: 'Portugal' },
  { code: 'ES', label: 'Espanha' },
  { code: 'FR', label: 'França' },
  { code: 'DE', label: 'Alemanha' },
  { code: 'IT', label: 'Itália' },
  { code: 'NL', label: 'Países Baixos' },
  { code: 'BE', label: 'Bélgica' },
  { code: 'AT', label: 'Áustria' },
  { code: 'IE', label: 'Irlanda' },
  { code: 'GB', label: 'Reino Unido' },
  { code: 'CH', label: 'Suíça' },
]

const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-sm text-white placeholder-[#A1A1A1] focus:border-[#0070C9] focus:outline-none'

const cardElementStyle = {
  style: {
    base: {
      color: '#FFFFFF',
      fontFamily: 'inherit',
      fontSize: '14px',
      '::placeholder': { color: '#A1A1A1' },
      backgroundColor: '#1A1A1A',
    },
    invalid: { color: '#f87171' },
  },
}

interface Props {
  versionId?: string
}

export default function StripePaymentForm({ versionId }: Props) {
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
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-10 rounded-lg bg-card" />
        <div className="h-11 rounded-lg bg-card" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CardElementForm clientSecret={clientSecret} />
    </Elements>
  )
}

function CardElementForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('PT')
  const [taxId, setTaxId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: store TAX ID in PI metadata
      const updateRes = await fetch('/api/payment-intent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSecret, taxId }),
      })
      if (!updateRes.ok) {
        setError('Ocorreu um erro. Tenta novamente.')
        setSubmitting(false)
        return
      }

      // Step 2: confirm payment with billing details
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) { setSubmitting(false); return }

      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name,
              address: { line1, city, postal_code: postalCode, country },
            },
          },
        },
      ) as { error: StripeError | null }

      if (stripeError) {
        setError(stripeError.message ?? 'Ocorreu um erro. Tenta novamente.')
        setSubmitting(false)
      } else {
        window.location.href = window.location.origin + '/obrigado'
      }
    } catch {
      setError('Ocorreu um erro. Tenta novamente.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="billing-name" className="mb-1 block text-xs text-[#A1A1A1]">Nome completo</label>
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

      <div>
        <label htmlFor="billing-line1" className="mb-1 block text-xs text-[#A1A1A1]">Morada</label>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="billing-city" className="mb-1 block text-xs text-[#A1A1A1]">Cidade</label>
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
          <label htmlFor="billing-postal" className="mb-1 block text-xs text-[#A1A1A1]">Código postal</label>
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

      <div>
        <label htmlFor="billing-country" className="mb-1 block text-xs text-[#A1A1A1]">País</label>
        <select
          id="billing-country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        >
          {COUNTRIES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="billing-taxid" className="mb-1 block text-xs text-[#A1A1A1]">NIF / NIPC</label>
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

      <div className="rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3">
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

- [ ] **Step 4: Run the component tests**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: PASS — all tests green

- [ ] **Step 5: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass. If any unrelated tests fail, note them — they were failing before this change.

- [ ] **Step 6: Commit**

```bash
git add src/components/forms/StripePaymentForm.tsx tests/components/forms/StripePaymentForm.test.tsx
git commit -m "feat: add billing fields (name, address, TAX ID) to Stripe payment form"
```
