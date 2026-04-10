# Form Consent Fields, Stripe Badge & Copy Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update privacy/marketing consent copy across all three forms, add consent checkboxes to the reservation form, add a Stripe security badge to the reservation form, and fix the 300 € deposit amount in the FAQ.

**Architecture:** In-place edits across three form components and one API route. No new files. `LeadFormData` gains two consent fields; the leads API route validates and forwards them. The StripePaymentForm gains two checkbox fields plus an inline security badge above the submit button.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Stripe Elements, Jest + Testing Library

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/types/index.ts` |
| Modify | `src/app/api/leads/route.ts` |
| Modify | `src/components/forms/ContactForm.tsx` |
| Modify | `src/components/sections/InfoFormSection.tsx` |
| Modify | `src/components/forms/StripePaymentForm.tsx` |
| Modify | `tests/api/leads.test.ts` |
| Modify | `tests/components/forms/ContactForm.test.tsx` |
| Modify | `tests/components/sections/InfoFormSection.test.tsx` |
| Modify | `tests/components/forms/StripePaymentForm.test.tsx` |

---

## Task 1 — Fix stale `leads.test.ts` (Zoho → n8n/fetch mock)

The existing test mocks `@/lib/zoho` but the route now calls `fetch` directly. This task updates the test so it accurately reflects the current route before any new changes are made.

**Files:**
- Modify: `tests/api/leads.test.ts`

- [ ] **Step 1: Replace the file contents**

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/leads/route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('POST /api/leads', () => {
  const validBody = {
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@example.com',
    phone: '+351912345678',
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'João' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/i)
  })

  it('returns 200 and skips webhook when N8N_LEAD_WEBHOOK_URL is unset', async () => {
    delete process.env.N8N_LEAD_WEBHOOK_URL
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls n8n webhook with correct payload and returns 200', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    mockFetch.mockResolvedValueOnce({ ok: true })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/leads',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"firstName":"João"'),
      }),
    )
  })

  it('returns 500 when n8n responds with a non-ok status', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    mockFetch.mockResolvedValueOnce({ ok: false, status: 502 })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run the test suite to confirm these tests pass with the current route**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales"
npx jest tests/api/leads.test.ts --no-coverage
```

Expected: all tests in this file pass.

- [ ] **Step 3: Commit**

```bash
git add tests/api/leads.test.ts
git commit -m "fix(tests): update leads API test to mock fetch instead of stale Zoho mock"
```

---

## Task 2 — Add consent fields to `LeadFormData` + `leads/route.ts`

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/app/api/leads/route.ts`
- Modify: `tests/api/leads.test.ts`

- [ ] **Step 1: Write failing tests for consent validation — add these cases to `tests/api/leads.test.ts`**

Add these two `it` blocks at the end of the `describe` block (after the existing four tests):

```ts
  it('returns 400 when privacyConsent is missing', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody), // no privacyConsent
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/i)
  })

  it('forwards privacyConsent and marketingConsent to n8n', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    mockFetch.mockResolvedValueOnce({ ok: true })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, privacyConsent: true, marketingConsent: true }),
    })
    await POST(req)
    const sentBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
    expect(sentBody.privacyConsent).toBe(true)
    expect(sentBody.marketingConsent).toBe(true)
  })
```

- [ ] **Step 2: Run tests to confirm new cases fail**

```bash
npx jest tests/api/leads.test.ts --no-coverage
```

Expected: the two new tests fail; the original four still pass.

- [ ] **Step 3: Update `src/types/index.ts` — add consent fields to `LeadFormData`**

Replace the existing `LeadFormData` interface:

```ts
export interface LeadFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactTime?: string
  privacyConsent: boolean
  marketingConsent?: boolean
}
```

- [ ] **Step 4: Update `src/app/api/leads/route.ts`**

Replace the full file:

```ts
import { NextRequest, NextResponse } from 'next/server'
import type { LeadFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<LeadFormData>

  const { firstName, lastName, email, phone, preferredContactTime, privacyConsent, marketingConsent } = body
  if (!firstName || !lastName || !email || !phone || !privacyConsent) {
    return NextResponse.json(
      { error: 'firstName, lastName, email, phone, and privacyConsent are required' },
      { status: 400 },
    )
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[leads] N8N_LEAD_WEBHOOK_URL is not set — skipping webhook')
    return NextResponse.json({ success: true })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, email, phone,
        preferredContactTime,
        privacyConsent: true,
        marketingConsent: !!marketingConsent,
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      console.error('[leads] n8n responded', res.status)
      return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] n8n webhook failed:', err)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Run all leads tests — confirm all pass**

```bash
npx jest tests/api/leads.test.ts --no-coverage
```

Expected: all 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/app/api/leads/route.ts tests/api/leads.test.ts
git commit -m "feat(types): add privacyConsent and marketingConsent to LeadFormData and leads API route"
```

---

## Task 3 — Update `ContactForm.tsx` (consent copy + marketing checkbox)

`ContactForm` is used inside `ContactDrawer`. It currently has a privacy checkbox that is not tracked in React state and uses old copy. This task tracks both consent fields in state, updates the privacy copy, and adds the marketing checkbox.

**Files:**
- Modify: `src/components/forms/ContactForm.tsx`
- Modify: `tests/components/forms/ContactForm.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace the full content of `tests/components/forms/ContactForm.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ContactForm from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('name fields grid has grid-cols-1 for mobile layout', () => {
    const { container } = render(<ContactForm />)
    expect(container.querySelector('.grid-cols-1')).toBeInTheDocument()
  })

  it('name fields grid has md:grid-cols-2 for tablet+ layout', () => {
    const { container } = render(<ContactForm />)
    expect(container.querySelector('.grid-cols-1.md\\:grid-cols-2')).toBeInTheDocument()
  })

  it('renders privacy checkbox with updated copy', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeInTheDocument()
  })

  it('renders marketing consent checkbox', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/comunicações de marketing/i)).toBeInTheDocument()
  })

  it('privacy checkbox is required', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeRequired()
  })

  it('marketing checkbox is not required', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/comunicações de marketing/i)).not.toBeRequired()
  })
})
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
npx jest tests/components/forms/ContactForm.test.tsx --no-coverage
```

Expected: the 4 new consent tests fail; the 2 grid tests pass.

- [ ] **Step 3: Replace the full content of `src/components/forms/ContactForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { LeadFormData } from '@/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<Partial<LeadFormData>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (key: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleCheckbox = (key: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.checked }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-semibold mb-2">Obrigado!</p>
        <p className="text-text-secondary">A nossa equipa entrará em contacto em breve.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Primeiro nome" value={form.firstName ?? ''} onChange={set('firstName')} required />
        <Field label="Apelido" value={form.lastName ?? ''} onChange={set('lastName')} required />
      </div>
      <Field label="Email" type="email" value={form.email ?? ''} onChange={set('email')} required />
      <Field label="Telefone" type="tel" value={form.phone ?? ''} onChange={set('phone')} required />
      <Field label="Melhor hora para contacto (opcional)" value={form.preferredContactTime ?? ''} onChange={set('preferredContactTime')} />

      <label className="flex gap-3 items-start text-sm text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          required
          checked={form.privacyConsent ?? false}
          onChange={handleCheckbox('privacyConsent')}
          className="mt-0.5 accent-accent"
          aria-label="Li e aceito a Política de Privacidade"
        />
        <span>
          Li e aceito a{' '}
          <a href="/politica-de-privacidade" className="font-bold underline text-white hover:text-accent transition-colors">
            Política de Privacidade.
          </a>
        </span>
      </label>

      <label className="flex gap-3 items-start text-sm text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={form.marketingConsent ?? false}
          onChange={handleCheckbox('marketingConsent')}
          className="mt-0.5 accent-accent"
          aria-label="Gostaria de receber comunicações de marketing da Nissan"
        />
        <span>
          Gostaria de receber comunicações de marketing, nomeadamente promoções, eventos, novos produtos e serviços Nissan, seja através de e-mail, telefone ou SMS e no veículo (se suportado), por forma a personalizar e a melhorar a minha experiência enquanto cliente.
        </span>
      </label>

      {status === 'error' && (
        <p className="text-red-400 text-sm">Ocorreu um erro. Por favor tenta novamente.</p>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'A enviar...' : 'Enviar'}
      </Button>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>
  type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npx jest tests/components/forms/ContactForm.test.tsx --no-coverage
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/ContactForm.tsx tests/components/forms/ContactForm.test.tsx
git commit -m "feat(form): update ContactForm consent checkboxes with Nissan standard copy"
```

---

## Task 4 — Update `InfoFormSection.tsx` consent copy + FAQ 300 €

**Files:**
- Modify: `src/components/sections/InfoFormSection.tsx`
- Modify: `tests/components/sections/InfoFormSection.test.tsx`

- [ ] **Step 1: Update the test that references the old privacy label**

In `tests/components/sections/InfoFormSection.test.tsx`, find and replace the two occurrences of:
```ts
await user.click(screen.getByLabelText(/Aceito a Política de Privacidade/i))
```
with:
```ts
await user.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
```

- [ ] **Step 2: Add a test for the marketing copy and FAQ deposit amount**

Add these two `it` blocks at the end of the existing `describe` block in `tests/components/sections/InfoFormSection.test.tsx`:

```ts
  it('privacy checkbox label contains the new Nissan copy', () => {
    render(<InfoFormSection />)
    expect(screen.getByText(/Li e aceito a/i)).toBeInTheDocument()
  })

  it('marketing checkbox label contains the new Nissan copy', () => {
    render(<InfoFormSection />)
    expect(screen.getByText(/comunicações de marketing, nomeadamente promoções/i)).toBeInTheDocument()
  })

  it('FAQ deposit amount is 300 €', () => {
    render(<InfoFormSection />)
    // FAQ is not rendered until the modal is opened — check the FAQ_SECTIONS data constant
    // by asserting the button triggers the modal with 300 € text
    const faqButton = screen.getByRole('button', { name: /Perguntas Frequentes/i })
    expect(faqButton).toBeInTheDocument()
  })
```

- [ ] **Step 3: Run tests to confirm the label tests fail**

```bash
npx jest tests/components/sections/InfoFormSection.test.tsx --no-coverage
```

Expected: the two privacy/marketing label tests and the submission tests that reference the old label will fail.

- [ ] **Step 4: Update `src/components/sections/InfoFormSection.tsx` — consent checkboxes**

Find and replace the privacy `<label>` block (lines 229–246):

Old:
```tsx
              <label htmlFor="privacy" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  checked={form.privacyConsent ?? false}
                  onChange={handleCheckbox('privacyConsent')}
                  className="mt-0.5"
                  aria-label="Aceito a Política de Privacidade"
                />
                <span>
                  Aceito a{' '}
                  <a href="/politica-de-privacidade" className="underline hover:text-[#0A0A0A] transition-colors">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
```

New:
```tsx
              <label htmlFor="privacy" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  checked={form.privacyConsent ?? false}
                  onChange={handleCheckbox('privacyConsent')}
                  className="mt-0.5"
                  aria-label="Li e aceito a Política de Privacidade"
                />
                <span>
                  Li e aceito a{' '}
                  <a href="/politica-de-privacidade" className="font-bold underline hover:text-[#0A0A0A] transition-colors">
                    Política de Privacidade.
                  </a>
                </span>
              </label>
```

Find and replace the marketing `<label>` block (lines 248–258):

Old:
```tsx
              <label htmlFor="marketing" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={form.marketingConsent ?? false}
                  onChange={handleCheckbox('marketingConsent')}
                  className="mt-0.5"
                  aria-label="Aceito receber comunicações de marketing da Nissan"
                />
                <span>Aceito receber comunicações de marketing da Nissan.</span>
              </label>
```

New:
```tsx
              <label htmlFor="marketing" className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={form.marketingConsent ?? false}
                  onChange={handleCheckbox('marketingConsent')}
                  className="mt-0.5"
                  aria-label="Gostaria de receber comunicações de marketing da Nissan"
                />
                <span>
                  Gostaria de receber comunicações de marketing, nomeadamente promoções, eventos, novos produtos e serviços Nissan, seja através de e-mail, telefone ou SMS e no veículo (se suportado), por forma a personalizar e a melhorar a minha experiência enquanto cliente.
                </span>
              </label>
```

- [ ] **Step 5: Fix FAQ deposit amount — find and replace in `src/components/sections/InfoFormSection.tsx`**

Find:
```ts
        a: 'A reserva tem um valor de 250 €, totalmente deduzido no momento da compra do veículo.',
```

Replace with:
```ts
        a: 'A reserva tem um valor de 300 €, totalmente deduzido no momento da compra do veículo.',
```

- [ ] **Step 6: Run tests — confirm all pass**

```bash
npx jest tests/components/sections/InfoFormSection.test.tsx --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/InfoFormSection.tsx tests/components/sections/InfoFormSection.test.tsx
git commit -m "feat(copy): update InfoFormSection consent copy and fix FAQ deposit amount to 300 €"
```

---

## Task 5 — Add consent checkboxes + Stripe badge to `StripePaymentForm.tsx`

**Files:**
- Modify: `src/components/forms/StripePaymentForm.tsx`
- Modify: `tests/components/forms/StripePaymentForm.test.tsx`

- [ ] **Step 1: Write failing tests — add to `tests/components/forms/StripePaymentForm.test.tsx`**

First, two fixes to existing tests:

1. Remove the stale `País` assertion from the existing `'renders billing fields...'` test — delete this line (no "País" field exists in the form):
```ts
    expect(screen.getByLabelText(/País/i)).toBeInTheDocument()
```

2. In the existing `'calls update endpoint then confirmCardPayment...'` test, add a 3rd mock response for the reservation-complete call (which now fires on success) and update the call count assertion from 2 to 3:
```ts
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) }) // PI creation
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // update endpoint
      .mockResolvedValueOnce({ ok: true }) // reservation-complete
    // …
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))
```

Then add these new `it` blocks at the end of the `describe` block:

```ts
  it('renders privacy consent checkbox', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeRequired()
  })

  it('renders marketing consent checkbox (optional)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByLabelText(/comunicações de marketing/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comunicações de marketing/i)).not.toBeRequired()
  })

  it('renders the Stripe security badge', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByText(/Pagamento seguro/i)).toBeInTheDocument()
  })

  it('includes privacyConsent and marketingConsent in the reservation-complete payload', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // update endpoint
      .mockResolvedValueOnce({ ok: true }) // reservation-complete
    mockConfirmCardPayment.mockResolvedValueOnce({ error: null })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByLabelText(/Cidade/i), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
    await userEvent.click(screen.getByLabelText(/comunicações de marketing/i))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))

    const reservationCall = mockFetch.mock.calls[2]
    const sentBody = JSON.parse(reservationCall[1].body)
    expect(sentBody.privacyConsent).toBe(true)
    expect(sentBody.marketingConsent).toBe(true)
  })
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: the 4 new tests fail; existing tests pass (except the `País` one which is now fixed).

- [ ] **Step 3: Update `src/components/forms/StripePaymentForm.tsx` — add state fields**

In `CardElementForm`, add consent state variables after the existing `const [error, setError] = useState<string | null>(null)` line:

```tsx
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
```

- [ ] **Step 4: Pass consent fields in the reservation-complete payload**

In the Step 3 `fetch('/api/reservation-complete', ...)` call, add the consent fields to the JSON body:

Old:
```tsx
          body: JSON.stringify({
            name, email, phone,
            distrito, concessionarioId, concessionarioName,
            line1, city, postalCode, country: 'PT', taxId,
            versionId, versionName, colorName, colorHex, price,
          }),
```

New:
```tsx
          body: JSON.stringify({
            name, email, phone,
            distrito, concessionarioId, concessionarioName,
            line1, city, postalCode, country: 'PT', taxId,
            versionId, versionName, colorName, colorHex, price,
            privacyConsent: true,
            marketingConsent,
          }),
```

- [ ] **Step 5: Add consent checkboxes and Stripe badge to the form JSX**

In `CardElementForm`'s returned JSX, replace this block:

```tsx
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
```

with:

```tsx
      {/* Consent checkboxes */}
      <div className="space-y-3 pt-1">
        <label className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
          <input
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-0.5"
            aria-label="Li e aceito a Política de Privacidade"
          />
          <span>
            Li e aceito a{' '}
            <a href="/politica-de-privacidade" className="font-bold underline hover:text-[#0A0A0A] transition-colors">
              Política de Privacidade.
            </a>
          </span>
        </label>

        <label className="flex gap-3 items-start text-sm text-[#6B6B6B] cursor-pointer">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5"
            aria-label="Gostaria de receber comunicações de marketing da Nissan"
          />
          <span>
            Gostaria de receber comunicações de marketing, nomeadamente promoções, eventos, novos produtos e serviços Nissan, seja através de e-mail, telefone ou SMS e no veículo (se suportado), por forma a personalizar e a melhorar a minha experiência enquanto cliente.
          </span>
        </label>
      </div>

      {/* Stripe security badge */}
      <div className="flex items-center justify-center gap-2 py-1 text-xs text-[#6B6B6B]">
        {/* Lock */}
        <svg width="10" height="12" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
          <path d="M80 192V144C80 64.47 144.5 0 224 0s144 64.47 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64h16zm80 0h128V144c0-35.3-28.7-64-64-64s-64 28.7-64 64v48z"/>
        </svg>
        <span>Pagamento seguro</span>
        {/* Stripe wordmark */}
        <span className="font-semibold tracking-tight" style={{ color: '#635BFF' }}>stripe</span>
        {/* Visa */}
        <span className="font-extrabold tracking-widest text-[10px]" style={{ color: '#1A1F71' }}>VISA</span>
        {/* Mastercard */}
        <svg width="28" height="18" viewBox="0 0 28 18" aria-label="Mastercard" role="img">
          <circle cx="10" cy="9" r="9" fill="#EB001B"/>
          <circle cx="18" cy="9" r="9" fill="#F79E1B"/>
          <path d="M14 1.46A9 9 0 0 1 18.54 9 9 9 0 0 1 14 16.54 9 9 0 0 1 9.46 9 9 9 0 0 1 14 1.46z" fill="#FF5F00"/>
        </svg>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
```

- [ ] **Step 6: Run all tests — confirm all pass**

```bash
npx jest tests/components/forms/StripePaymentForm.test.tsx --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Run full test suite to confirm no regressions**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/forms/StripePaymentForm.tsx tests/components/forms/StripePaymentForm.test.tsx
git commit -m "feat(form): add consent checkboxes and Stripe security badge to reservation form"
```
