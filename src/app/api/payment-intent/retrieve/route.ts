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
