/**
 * @jest-environment node
 */
// tests/api/payment-intent.test.ts
import { POST } from '@/app/api/payment-intent/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockCreate = stripe.paymentIntents.create as jest.Mock

describe('POST /api/payment-intent', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('creates a PaymentIntent and returns clientSecret', async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: 'pi_test_secret_123' })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({ versionId: 'visia' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clientSecret).toBe('pi_test_secret_123')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 30000,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: expect.objectContaining({ versionId: 'visia' }),
    }))
  })

  it('works without a versionId', async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: 'pi_test_secret_456' })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.clientSecret).toBe('pi_test_secret_456')
  })

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
