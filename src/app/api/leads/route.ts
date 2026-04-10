import { NextRequest, NextResponse } from 'next/server'
import type { LeadFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<LeadFormData>

  const { firstName, lastName, email, phone, preferredContactTime, privacyConsent, marketingConsent } = body
  if (!firstName || !lastName || !email || !phone || privacyConsent !== true) {
    return NextResponse.json(
      { error: 'firstName, lastName, email, phone, and privacyConsent are required' },
      { status: 400 },
    )
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[leads] N8N_LEAD_WEBHOOK_URL is not set — skipping webhook')
    return NextResponse.json({ success: true })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, email, phone,
        preferredContactTime,
        privacyConsent: true,
        marketingConsent: !!marketingConsent,
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      console.error('[leads] n8n responded', res.status)
      return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] n8n webhook failed:', err)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
