/**
 * @jest-environment node
 */
// tests/api/payment-intent-update.test.ts
import { POST } from '@/app/api/payment-intent/update/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      update: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'
const mockUpdate = stripe.paymentIntents.update as jest.Mock

describe('POST /api/payment-intent/update', () => {
  const BASE_URL = 'http://localhost'

  beforeEach(() => jest.clearAllMocks())

  it('updates PI metadata with taxId and returns ok', async () => {
    mockUpdate.mockResolvedValueOnce({})
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_abc123_secret_xyz', taxId: '123456789' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith('pi_abc123', { metadata: { taxId: '123456789' } })
  })

  it('derives intentId correctly from clientSecret', async () => {
    mockUpdate.mockResolvedValueOnce({})
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_3Pxyz_secret_abc', taxId: 'PT123' }),
    })
    await POST(req)
    expect(mockUpdate).toHaveBeenCalledWith('pi_3Pxyz', { metadata: { taxId: 'PT123' } })
  })

  it('returns 500 when Stripe throws', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Stripe error'))
    const req = new NextRequest(`${BASE_URL}/api/payment-intent/update`, {
      method: 'POST',
      body: JSON.stringify({ clientSecret: 'pi_abc_secret_xyz', taxId: '123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Failed to update payment intent')
  })
})
