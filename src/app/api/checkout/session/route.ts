import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['payment_intent'],
    })
    const pi = session.payment_intent as { id: string } | null

    return NextResponse.json({
      email: session.customer_details?.email ?? '',
      amount: `€${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      paymentIntentId: pi?.id ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
