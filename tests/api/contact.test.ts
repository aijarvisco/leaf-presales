/**
 * @jest-environment node
 */
import type { ContactFormData } from '@/types'
import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

const validBody: ContactFormData = {
  nome: 'João Silva',
  telemovel: '+351912345678',
  email: 'joao@example.com',
  distrito: 'LISBOA',
  concessionarioId: 'NI00100003',
  privacyConsent: true,
  marketingConsent: false,
}

describe('POST /api/contact', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ nome: 'João' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/i)
  })

  it('returns 400 when privacyConsent is false', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, privacyConsent: false }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with { success: true } for a valid payload', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })

  it('returns 200 when optional fields are absent', async () => {
    const { mensagem, marketingConsent, ...required } = validBody
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(required),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
