// tests/obrigado/ObrigadoContent.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import ObrigadoContent from '@/app/obrigado/ObrigadoContent'

// next/navigation is mocked by the jest/next setup, but we override per-test
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

import { useSearchParams } from 'next/navigation'
const mockUseSearchParams = useSearchParams as jest.Mock

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ObrigadoContent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders confirmation text regardless of query params', () => {
    mockUseSearchParams.mockReturnValue({ get: () => null })
    render(<ObrigadoContent />)
    expect(screen.getByText(/Reserva confirmada/i)).toBeInTheDocument()
  })

  it('fetches order details via session_id and renders them', async () => {
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => key === 'session_id' ? 'cs_test_123' : null,
    })
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ email: 'joao@test.com', amount: '€300.00', paymentIntentId: 'pi_abc' }),
    })
    render(<ObrigadoContent />)
    await waitFor(() => expect(screen.getByText('joao@test.com')).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/checkout/session?id=cs_test_123'))
  })

  it('fetches order details via payment_intent and renders them', async () => {
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => key === 'payment_intent' ? 'pi_test_456' : null,
    })
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ email: 'maria@test.com', amount: '€300.00', paymentIntentId: 'pi_test_456' }),
    })
    render(<ObrigadoContent />)
    await waitFor(() => expect(screen.getByText('maria@test.com')).toBeInTheDocument())
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/payment-intent/retrieve?id=pi_test_456'))
  })

  it('shows no order block when both params are absent', () => {
    mockUseSearchParams.mockReturnValue({ get: () => null })
    render(<ObrigadoContent />)
    expect(screen.queryByText('€300.00')).not.toBeInTheDocument()
  })
})
