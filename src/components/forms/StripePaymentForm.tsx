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
