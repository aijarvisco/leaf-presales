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
  } catch (err) {
    console.error('[payment-intent/update]', err)
    return NextResponse.json({ error: 'Failed to update payment intent' }, { status: 500 })
  }
}
