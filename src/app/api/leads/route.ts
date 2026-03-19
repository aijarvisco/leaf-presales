import { NextRequest, NextResponse } from 'next/server'
import { createZohoLead } from '@/lib/zoho'
import type { LeadFormData } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<LeadFormData>

  const { firstName, lastName, email, phone } = body
  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json({ error: 'firstName, lastName, email, and phone are required' }, { status: 400 })
  }

  try {
    const result = await createZohoLead({ firstName, lastName, email, phone, preferredContactTime: body.preferredContactTime })
    return NextResponse.json({ success: true, id: result.id })
  } catch {
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
