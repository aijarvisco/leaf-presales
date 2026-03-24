// src/app/api/payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const DEPOSIT_AMOUNT_CENTS = 30000 // €300.00

export async function POST(req: NextRequest) {
  try {
    const { versionId } = await req.json() as { versionId?: string }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: DEPOSIT_AMOUNT_CENTS,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { versionId: versionId ?? '' },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
