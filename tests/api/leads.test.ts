/**
 * @jest-environment node
 */
import { POST } from '@/app/api/leads/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/zoho', () => ({
  createZohoLead: jest.fn(),
}))

import { createZohoLead } from '@/lib/zoho'
const mockCreateZohoLead = createZohoLead as jest.Mock

describe('POST /api/leads', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ firstName: 'João' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/required/i)
  })

  it('calls createZohoLead with correct data and returns 200', async () => {
    mockCreateZohoLead.mockResolvedValueOnce({ id: 'lead-123' })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        phone: '+351912345678',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockCreateZohoLead).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
    }))
  })

  it('returns 500 when Zoho call fails', async () => {
    mockCreateZohoLead.mockRejectedValueOnce(new Error('Zoho error'))
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'João', lastName: 'Silva',
        email: 'joao@example.com', phone: '+351912345678',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
