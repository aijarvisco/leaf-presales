// src/components/forms/StripePaymentForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import type { StripeError } from '@stripe/stripe-js'
import dealersData from '@/data/concessionarios.json'

// ─── Dealer helpers (same logic as InfoFormSection) ───────────────────────────

interface Dealer {
  designation: string
  objectId: string
  address: string
}

const districts = [...new Set(dealersData.map((d) => d.district).filter(Boolean))].sort(
  (a, b) => a.localeCompare(b, 'pt'),
)

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
  hidePostalCode: true,
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

      // Step 3: dispatch to n8n via internal route — wrap in its own catch so a
      // webhook failure never surfaces as a payment error (payment already captured)
      try {
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
      } catch {
        // webhook failed — payment already captured, redirect anyway
      }

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

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'A processar...' : 'Reservar agora — €300'}
      </button>
    </form>
  )
}
