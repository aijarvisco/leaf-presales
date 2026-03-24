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
