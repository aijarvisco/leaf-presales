// tests/components/forms/StripePaymentForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

// Mock the entire @stripe/react-stripe-js package
const mockConfirmPayment = jest.fn()
const mockUseStripe = jest.fn(() => ({ confirmPayment: mockConfirmPayment }))
const mockUseElements = jest.fn(() => ({}))

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => mockUseStripe(),
  useElements: () => mockUseElements(),
}))

// Mock the stripe-client singleton
jest.mock('@/lib/stripe-client', () => ({ stripePromise: Promise.resolve(null) }))

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('StripePaymentForm', () => {
  // window.location.origin is set to 'http://localhost:3000' via
  // testEnvironmentOptions.url in jest.config.ts (required for jsdom 30+)

  beforeEach(() => {
    jest.clearAllMocks()
    // Restore useStripe implementation after clearAllMocks resets it
    mockUseStripe.mockImplementation(() => ({ confirmPayment: mockConfirmPayment }))
  })

  it('shows a loading skeleton while fetching clientSecret', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<StripePaymentForm />)
    expect(screen.getByTestId('payment-form-skeleton')).toBeInTheDocument()
  })

  it('renders the PaymentElement after fetching clientSecret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByTestId('payment-element')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Reservar agora/i })).toBeInTheDocument()
  })

  it('shows error state with retry button when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument())
  })

  it('calls confirmPayment with the correct return_url on submit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    mockConfirmPayment.mockResolvedValueOnce({ error: null })
    render(<StripePaymentForm versionId="visia" />)
    await waitFor(() => screen.getByRole('button', { name: /Reservar agora/i }))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))
    expect(mockConfirmPayment).toHaveBeenCalledWith(expect.objectContaining({
      confirmParams: expect.objectContaining({
        return_url: 'http://localhost:3000/obrigado',
      }),
    }))
  })

  it('shows a Stripe error message when confirmPayment fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_test_secret' }),
    })
    mockConfirmPayment.mockResolvedValueOnce({ error: { message: 'O teu cartão foi recusado.' } })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByRole('button', { name: /Reservar agora/i }))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))
    await waitFor(() => expect(screen.getByText('O teu cartão foi recusado.')).toBeInTheDocument())
  })
})
