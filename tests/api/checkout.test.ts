/**
 * @jest-environment node
 */
import { POST } from '@/app/api/checkout/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockCreate = stripe.checkout.sessions.create as jest.Mock

describe('POST /api/checkout', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('creates a Stripe session and returns the URL', async () => {
    mockCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/session-123' })
    const req = new NextRequest(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://checkout.stripe.com/session-123')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      metadata: expect.objectContaining({ versionId: 'visia' }),
    }))
  })

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
