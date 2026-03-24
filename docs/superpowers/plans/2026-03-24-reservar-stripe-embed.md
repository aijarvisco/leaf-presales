# Reservar — Embedded Stripe Payment Element Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redirect-to-Stripe button in the Reservar section with an embedded Stripe Payment Element that lets users pay directly on the page.

**Architecture:** On page load `CTASection` fetches a PaymentIntent `clientSecret` from a new API route, passes it to Stripe's `<Elements>` provider, and renders `<PaymentElement>` inline. On success Stripe redirects to `/obrigado?payment_intent=...`; the confirmation page is updated to also handle that query param alongside the existing `?session_id=` path.

**Tech Stack:** Next.js 15 App Router, `@stripe/react-stripe-js`, `@stripe/stripe-js`, Stripe Node SDK, Jest + React Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/stripe-client.ts` | Singleton `stripePromise` for client-side use |
| Create | `src/app/api/payment-intent/route.ts` | `POST` — create PaymentIntent, return `clientSecret` |
| Create | `src/app/api/payment-intent/retrieve/route.ts` | `GET` — retrieve PaymentIntent details for confirmation page |
| Create | `src/components/forms/StripePaymentForm.tsx` | Embedded payment form component |
| Modify | `src/components/sections/CTASection.tsx` | Swap button for `<StripePaymentForm />` |
| Modify | `src/app/obrigado/ObrigadoContent.tsx` | Handle `?payment_intent=` in addition to `?session_id=` |
| Create | `tests/api/payment-intent.test.ts` | Unit tests for `POST /api/payment-intent` |
| Create | `tests/api/payment-intent-retrieve.test.ts` | Unit tests for `GET /api/payment-intent/retrieve` |
| Create | `tests/components/forms/StripePaymentForm.test.tsx` | Component tests for embedded form |
| Create | `tests/components/sections/CTASection.test.tsx` | Smoke test that form renders in CTASection |
| Create | `tests/obrigado/ObrigadoContent.test.tsx` | Tests for both confirmation paths |

---

## Task 1: Install dependency and prepare environment

**Files:**
- Modify: `package.json` (via npm)
- Modify: `.env.local` (manual step)

- [ ] **Step 1: Verify `@stripe/stripe-js` is already installed, then install `@stripe/react-stripe-js`**

```bash
grep '"@stripe/stripe-js"' package.json
```

Expected: a line showing `@stripe/stripe-js` in dependencies. If absent, run `npm install @stripe/stripe-js` first.

```bash
npm install @stripe/react-stripe-js
```

Expected output: `@stripe/react-stripe-js` added to `dependencies` in `package.json`.

- [ ] **Step 2: Add the publishable key env var**

Open `.env.local` (create it if it doesn't exist) and add:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

Replace `pk_test_YOUR_KEY_HERE` with the actual Stripe test publishable key from the Stripe dashboard (Developers → API keys).

- [ ] **Step 3: Verify the install compiled cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 2: Create `src/lib/stripe-client.ts`

**Files:**
- Create: `src/lib/stripe-client.ts`

`loadStripe` must be called once at module level — never inside a component. If it were called inside a render function it would recreate the Stripe object on every render, causing the Payment Element to flicker and remount.

- [ ] **Step 1: Create the file**

```ts
// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe-client.ts package.json package-lock.json
git commit -m "feat: add stripe-client singleton and install react-stripe-js"
```

---

## Task 3: `POST /api/payment-intent` route + tests

**Files:**
- Create: `src/app/api/payment-intent/route.ts`
- Create: `tests/api/payment-intent.test.ts`

The route creates a Stripe PaymentIntent for €300 and returns the `clientSecret` to the client. The client secret is safe to expose — it allows only confirming this specific payment, not reading account data.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/api/payment-intent.test.ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/payment-intent/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockCreate = stripe.paymentIntents.create as jest.Mock

describe('POST /api/payment-intent', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('creates a PaymentIntent and returns clientSecret', async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: 'pi_test_secret_123' })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clientSecret).toBe('pi_test_secret_123')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 30000,
      currency: 'eur',
      metadata: expect.objectContaining({ versionId: 'visia' }),
    }))
  })

  it('works without a versionId', async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: 'pi_test_secret_456' })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clientSecret).toBe('pi_test_secret_456')
  })

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npx jest tests/api/payment-intent.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/payment-intent/route'`

- [ ] **Step 3: Create the route**

```ts
// src/app/api/payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const DEPOSIT_AMOUNT_CENTS = 30000 // €300.00

export async function POST(req: NextRequest) {
  const { versionId } = await req.json() as { versionId?: string }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: DEPOSIT_AMOUNT_CENTS,
      currency: 'eur',
      metadata: { versionId: versionId ?? '' },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npx jest tests/api/payment-intent.test.ts --no-coverage
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payment-intent/route.ts tests/api/payment-intent.test.ts
git commit -m "feat: add POST /api/payment-intent route"
```

---

## Task 4: `GET /api/payment-intent/retrieve` route + tests

**Files:**
- Create: `src/app/api/payment-intent/retrieve/route.ts`
- Create: `tests/api/payment-intent-retrieve.test.ts`

This route is called by `/obrigado` after Stripe redirects back. It retrieves the PaymentIntent with the `latest_charge` expanded so we can read `billing_details.email` — which is populated because `PaymentElement` is configured to always collect it.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/api/payment-intent-retrieve.test.ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/payment-intent/retrieve/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      retrieve: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockRetrieve = stripe.paymentIntents.retrieve as jest.Mock

describe('GET /api/payment-intent/retrieve', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('returns email, amount, and paymentIntentId', async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: 'pi_123',
      amount: 30000,
      latest_charge: {
        billing_details: { email: 'joao@example.com' },
      },
    })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_123`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      email: 'joao@example.com',
      amount: '€300.00',
      paymentIntentId: 'pi_123',
    })
    expect(mockRetrieve).toHaveBeenCalledWith('pi_123', { expand: ['latest_charge'] })
  })

  it('falls back to empty string if email is null', async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: 'pi_456',
      amount: 30000,
      latest_charge: { billing_details: { email: null } },
    })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_456`)
    const res = await GET(req)
    const body = await res.json()
    expect(body.email).toBe('')
  })

  it('returns 400 when id is missing', async () => {
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve`)
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when Stripe throws', async () => {
    mockRetrieve.mockRejectedValueOnce(new Error('Not found'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_bad`)
    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npx jest tests/api/payment-intent-retrieve.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/payment-intent/retrieve/route'`

- [ ] **Step 3: Create the route**

```ts
// src/app/api/payment-intent/retrieve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const pi = await stripe.paymentIntents.retrieve(id, {
      expand: ['latest_charge'],
    })

    const charge = pi.latest_charge as Stripe.Charge | null
    const email = charge?.billing_details?.email ?? ''

    return NextResponse.json({
      email,
      amount: `€${((pi.amount) / 100).toFixed(2)}`,
      paymentIntentId: pi.id,
    })
  } catch {
    return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 })
  }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npx jest tests/api/payment-intent-retrieve.test.ts --no-coverage
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payment-intent/retrieve/route.ts tests/api/payment-intent-retrieve.test.ts
git commit -m "feat: add GET /api/payment-intent/retrieve route"
```

---

## Task 5: `StripePaymentForm` component + tests

**Files:**
- Create: `src/components/forms/StripePaymentForm.tsx`
- Create: `tests/components/forms/StripePaymentForm.test.tsx`

This component has two parts: an outer shell (`StripePaymentForm`) that fetches the `clientSecret` and sets up the `<Elements>` provider, and an inner form (`PaymentElementForm`) that uses the `useStripe`/`useElements` hooks (which only work inside `<Elements>`).

When testing, we mock `@stripe/react-stripe-js` entirely — the Stripe SDK is not designed to run in jsdom.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/components/forms/StripePaymentForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

// Mock the entire @stripe/react-stripe-js package
const mockConfirmPayment = jest.fn()
const mockUseStripe = jest.fn(() => ({ confirmPayment: mockConfirmPayment }))
const mockUseElements = jest.fn(() => ({}))

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => mockUseStripe(),
  useElements: () => mockUseElements(),
}))

// Mock the stripe-client singleton
jest.mock('@/lib/stripe-client', () => ({ stripePromise: Promise.resolve(null) }))

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('StripePaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Restore useStripe implementation after clearAllMocks resets it
    mockUseStripe.mockImplementation(() => ({ confirmPayment: mockConfirmPayment }))
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('shows a loading skeleton while fetching clientSecret', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<StripePaymentForm />)
    expect(screen.getByTestId('payment-form-skeleton')).toBeInTheDocument()
  })

  it('renders the PaymentElement after fetching clientSecret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByTestId('payment-element')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Reservar agora/i })).toBeInTheDocument()
  })

  it('shows error state with retry button when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument())
  })

  it('calls confirmPayment with the correct return_url on submit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    mockConfirmPayment.mockResolvedValueOnce({ error: null })
    render(<StripePaymentForm versionId="visia" />)
    await waitFor(() => screen.getByRole('button', { name: /Reservar agora/i }))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))
    expect(mockConfirmPayment).toHaveBeenCalledWith(expect.objectContaining({
      confirmParams: expect.objectContaining({
        return_url: 'http://localhost:3000/obrigado',
      }),
    }))
  })

  it('shows a Stripe error message when confirmPayment fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    mockConfirmPayment.mockResolvedValueOnce({ error: { message: 'O teu cartão foi recusado.' } })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByRole('button', { name: /Reservar agora/i }))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))
    await waitFor(() => expect(screen.getByText('O teu cartão foi recusado.')).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/forms/StripePaymentForm'`

- [ ] **Step 3: Create the component**

```tsx
// src/components/forms/StripePaymentForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
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
        <div className="h-12 rounded-lg bg-card" />
        <div className="h-12 rounded-lg bg-card" />
        <div className="h-12 rounded-lg bg-card" />
        <div className="h-11 rounded-lg bg-card" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentElementForm />
    </Elements>
  )
}

function PaymentElementForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/obrigado',
      },
    }) as { error: StripeError | null }

    if (stripeError) {
      setError(stripeError.message ?? 'Ocorreu um erro. Tenta novamente.')
      setSubmitting(false)
    }
    // On success, Stripe redirects — no further action needed here
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ fields: { billingDetails: { email: 'always' } } }} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={submitting || !stripe}>
        {submitting ? 'A processar...' : 'Reservar agora — €300'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/StripePaymentForm.tsx tests/components/forms/StripePaymentForm.test.tsx
git commit -m "feat: add StripePaymentForm embedded component"
```

---

## Task 6: Update `CTASection`

**Files:**
- Modify: `src/components/sections/CTASection.tsx`
- Create: `tests/components/sections/CTASection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/sections/CTASection.test.tsx
import { render, screen } from '@testing-library/react'
import CTASection from '@/components/sections/CTASection'

// StripePaymentForm fetches on mount — mock it to avoid real network calls
jest.mock('@/components/forms/StripePaymentForm', () => ({
  __esModule: true,
  default: () => <div data-testid="stripe-payment-form" />,
}))

describe('CTASection', () => {
  it('renders the payment form and contact form side by side', () => {
    render(<CTASection selectedVersion="visia" />)
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()
    // Contact form is present
    expect(screen.getByText(/Preferes falar primeiro/i)).toBeInTheDocument()
    // No redirect button
    expect(screen.queryByRole('button', { name: /Reservar agora/i })).not.toBeInTheDocument()
  })

  it('renders the security note', () => {
    render(<CTASection />)
    expect(screen.getByText(/Pagamento seguro via Stripe/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test and confirm it fails**

```bash
npx jest tests/components/sections/CTASection.test.tsx --no-coverage
```

Expected: FAIL (security note not found or button still present).

- [ ] **Step 3: Update `CTASection`**

Replace the content of `src/components/sections/CTASection.tsx` with:

```tsx
'use client'
import { motion } from 'framer-motion'
import ContactForm from '@/components/forms/ContactForm'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

interface CTASectionProps {
  selectedVersion?: string
}

export default function CTASection({ selectedVersion }: CTASectionProps) {
  return (
    <section id="reservar" className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-start">

        {/* Left — Stripe */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Reserva o teu Leaf hoje.</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Garante o teu lugar com um depósito de €300, totalmente reembolsável.
            Sem compromisso adicional até à entrega.
          </p>
          <StripePaymentForm versionId={selectedVersion} />
          <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
            <span>🔒</span>
            <span>Pagamento seguro via Stripe · Depósito 100% reembolsável</span>
          </div>
        </motion.div>

        {/* Right — Contact form */}
        <motion.div
          id="contacto"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">Preferes falar primeiro?</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            A nossa equipa está pronta para responder a todas as tuas dúvidas.
          </p>
          <ContactForm />
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npx jest tests/components/sections/CTASection.test.tsx --no-coverage
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/CTASection.tsx tests/components/sections/CTASection.test.tsx
git commit -m "feat: replace redirect button with StripePaymentForm in CTASection"
```

---

## Task 7: Update `ObrigadoContent` to handle `?payment_intent=`

**Files:**
- Modify: `src/app/obrigado/ObrigadoContent.tsx`
- Create: `tests/obrigado/ObrigadoContent.test.tsx`

The current code bails out if `session_id` is absent. We add a parallel branch for `payment_intent`. Both paths feed the same `order` state and the render block is untouched.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/obrigado/ObrigadoContent.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import ObrigadoContent from '@/app/obrigado/ObrigadoContent'

// next/navigation is mocked by the jest/next setup, but we override per-test
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

import { useSearchParams } from 'next/navigation'
const mockUseSearchParams = useSearchParams as jest.Mock

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ObrigadoContent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders confirmation text regardless of query params', () => {
    mockUseSearchParams.mockReturnValue({ get: () => null })
    render(<ObrigadoContent />)
    expect(screen.getByText(/Reserva confirmada/i)).toBeInTheDocument()
  })

  it('fetches order details via session_id and renders them', async () => {
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => key === 'session_id' ? 'cs_test_123' : null,
    })
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ email: 'joao@test.com', amount: '€300.00', paymentIntentId: 'pi_abc' }),
    })
    render(<ObrigadoContent />)
    await waitFor(() => expect(screen.getByText('joao@test.com')).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/checkout/session?id=cs_test_123'))
  })

  it('fetches order details via payment_intent and renders them', async () => {
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => key === 'payment_intent' ? 'pi_test_456' : null,
    })
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ email: 'maria@test.com', amount: '€300.00', paymentIntentId: 'pi_test_456' }),
    })
    render(<ObrigadoContent />)
    await waitFor(() => expect(screen.getByText('maria@test.com')).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/payment-intent/retrieve?id=pi_test_456'))
  })

  it('shows no order block when both params are absent', () => {
    mockUseSearchParams.mockReturnValue({ get: () => null })
    render(<ObrigadoContent />)
    expect(screen.queryByText('€300.00')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npx jest tests/obrigado/ObrigadoContent.test.tsx --no-coverage
```

Expected: the `payment_intent` fetch test fails — the route isn't handled yet.

- [ ] **Step 3: Update `ObrigadoContent`**

Replace `src/app/obrigado/ObrigadoContent.tsx` with:

```tsx
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

interface OrderDetails {
  email: string
  amount: string
  paymentIntentId: string
}

export default function ObrigadoContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const paymentIntentId = params.get('payment_intent')
  const [order, setOrder] = useState<OrderDetails | null>(null)

  useEffect(() => {
    if (!sessionId && !paymentIntentId) return

    const url = sessionId
      ? `/api/checkout/session?id=${sessionId}`
      : `/api/payment-intent/retrieve?id=${paymentIntentId}`

    fetch(url)
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => null)
  }, [sessionId, paymentIntentId])

  return (
    <div className="max-w-xl text-center">
      <div className="text-5xl mb-6">✓</div>
      <h1 className="text-4xl font-bold mb-4">Reserva confirmada.</h1>
      <p className="text-xl text-text-secondary mb-2">Bem-vindo ao futuro.</p>
      <p className="text-text-secondary mb-8">
        O teu depósito de €300 foi recebido. A nossa equipa irá entrar em contacto em breve
        para confirmar os detalhes da tua encomenda.
      </p>

      {order && (
        <div className="bg-card rounded-xl p-5 text-left mb-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span>{order.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Valor pago</span>
            <span>{order.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Referência</span>
            <span className="font-mono text-xs">{order.paymentIntentId}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="primary" onClick={() => window.location.href = '/'}>
          Voltar ao início
        </Button>
        <Button variant="ghost" onClick={() => { window.location.href = '/#contacto' }}>
          Falar com a equipa
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npx jest tests/obrigado/ObrigadoContent.test.tsx --no-coverage
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/obrigado/ObrigadoContent.tsx tests/obrigado/ObrigadoContent.test.tsx
git commit -m "feat: update ObrigadoContent to handle payment_intent confirmation flow"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run the full test suite one more time**

```bash
npx jest --no-coverage
```

Expected: all tests PASS, no regressions.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start the dev server and manually test the flow**

```bash
npm run dev
```

1. Open `http://localhost:3000` and scroll to the Reservar section
2. Confirm the `<PaymentElement>` renders (card, expiry, CVC fields visible with dark theme)
3. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC
4. Submit — confirm redirect to `/obrigado` with order details showing email and amount
5. Also verify `/obrigado?session_id=cs_test_xxx` still works (open the existing checkout flow in a separate tab if needed, or manually append a fake session_id — the page should just show the confirmation text without order details if the session doesn't exist)
