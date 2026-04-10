/**
 * @jest-environment node
 */
import { POST } from '@/app/api/leads/route'
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('POST /api/leads', () => {
  const validBody = {
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@example.com',
    phone: '+351912345678',
  }

  const originalWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL
  const originalFetch = global.fetch

  afterAll(() => {
    global.fetch = originalFetch
    if (originalWebhookUrl === undefined) {
      delete process.env.N8N_LEAD_WEBHOOK_URL
    } else {
      process.env.N8N_LEAD_WEBHOOK_URL = originalWebhookUrl
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.N8N_LEAD_WEBHOOK_URL
  })

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

  it('returns 200 and skips webhook when N8N_LEAD_WEBHOOK_URL is unset', async () => {
    delete process.env.N8N_LEAD_WEBHOOK_URL
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls n8n webhook with correct payload and returns 200', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    mockFetch.mockResolvedValueOnce({ ok: true })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/leads',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"firstName":"João"'),
      }),
    )
  })

  it('returns 500 when n8n responds with a non-ok status', async () => {
    process.env.N8N_LEAD_WEBHOOK_URL = 'https://n8n.example.com/webhook/leads'
    mockFetch.mockResolvedValueOnce({ ok: false, status: 502 })
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
