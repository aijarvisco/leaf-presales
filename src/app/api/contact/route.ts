import { NextRequest, NextResponse } from 'next/server'
import type { ContactFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<ContactFormData>
  const { nome, telemovel, email, distrito, concessionarioId, privacyConsent } = body

  if (!nome || !telemovel || !email || !distrito || !concessionarioId || !privacyConsent) {
    return NextResponse.json(
      { error: 'nome, telemovel, email, distrito, concessionarioId, and privacyConsent are required' },
      { status: 400 },
    )
  }

  return NextResponse.json({ success: true })
}
