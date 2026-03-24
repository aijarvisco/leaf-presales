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
