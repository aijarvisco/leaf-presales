import { NextRequest, NextResponse } from 'next/server'
import type { ContactFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<ContactFormData>
  const { nome, telemovel, email, distrito, concessionarioId, privacyConsent, mensagem, marketingConsent } = body

  if (!nome || !telemovel || !email || !distrito || !concessionarioId || !privacyConsent) {
    return NextResponse.json(
      { error: 'nome, telemovel, email, distrito, concessionarioId, and privacyConsent are required' },
      { status: 400 },
    )
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[contact] N8N_LEAD_WEBHOOK_URL is not set — skipping webhook')
    return NextResponse.json({ success: true })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telemovel, email, distrito, concessionarioId, mensagem, marketingConsent: !!marketingConsent }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      console.error('[contact] n8n responded', res.status)
      return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] n8n webhook failed:', err)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
