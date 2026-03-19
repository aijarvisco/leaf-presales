import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const DEPOSIT_AMOUNT_CENTS = 30000 // €300.00

export async function POST(req: NextRequest) {
  const { versionId } = await req.json() as { versionId?: string }
  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: DEPOSIT_AMOUNT_CENTS,
          product_data: {
            name: 'Nissan Leaf — Depósito de Reserva',
            description: `Versão: ${versionId ?? 'a definir'}. Depósito totalmente reembolsável.`,
          },
        },
        quantity: 1,
      }],
      metadata: { versionId: versionId ?? '' },
      success_url: `${origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    })

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
