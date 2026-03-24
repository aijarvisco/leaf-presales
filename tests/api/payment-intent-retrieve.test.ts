/**
 * @jest-environment node
 */
// tests/api/payment-intent-retrieve.test.ts
import { GET } from '@/app/api/payment-intent/retrieve/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      retrieve: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockRetrieve = stripe.paymentIntents.retrieve as jest.Mock

describe('GET /api/payment-intent/retrieve', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('returns email, amount, and paymentIntentId', async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: 'pi_123',
      amount: 30000,
      latest_charge: {
        billing_details: { email: 'joao@example.com' },
      },
    })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_123`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      email: 'joao@example.com',
      amount: '€300.00',
      paymentIntentId: 'pi_123',
    })
    expect(mockRetrieve).toHaveBeenCalledWith('pi_123', { expand: ['latest_charge'] })
  })

  it('falls back to empty string if email is null', async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: 'pi_456',
      amount: 30000,
      latest_charge: { billing_details: { email: null } },
    })
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_456`)
    const res = await GET(req)
    const body = await res.json()
    expect(body.email).toBe('')
  })

  it('returns 400 when id is missing', async () => {
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve`)
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when Stripe throws', async () => {
    mockRetrieve.mockRejectedValueOnce(new Error('Not found'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/retrieve?id=pi_bad`)
    const res = await GET(req)
    expect(res.status).toBe(404)
  })
})
