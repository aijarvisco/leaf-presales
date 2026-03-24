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
