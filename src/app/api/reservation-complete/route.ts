// src/app/api/reservation-complete/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      console.warn('[reservation-complete] N8N_WEBHOOK_URL is not set — skipping webhook')
      return NextResponse.json({ ok: true })
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (webhookErr) {
      console.error('[reservation-complete] n8n webhook failed:', webhookErr)
      // payment already captured — do not block the user
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reservation-complete]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
