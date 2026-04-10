// tests/components/forms/StripePaymentForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

const mockConfirmCardPayment = jest.fn()
const mockGetElement = jest.fn(() => ({})) // returns a fake card element

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({ confirmCardPayment: mockConfirmCardPayment }),
  useElements: () => ({ getElement: mockGetElement }),
}))

jest.mock('@/lib/stripe-client', () => ({ stripePromise: Promise.resolve(null) }))

const mockFetch = jest.fn()
global.fetch = mockFetch

// clientSecret used across tests — intentId derived from the prefix before _secret_
const CLIENT_SECRET = 'pi_test123_secret_xyz'

describe('StripePaymentForm', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockGetElement.mockReturnValue({}) // always return a fake card element
  })

  it('shows a loading skeleton while fetching clientSecret', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<StripePaymentForm />)
    expect(screen.getByTestId('payment-form-skeleton')).toBeInTheDocument()
  })

  it('renders billing fields and card element after fetching clientSecret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByTestId('card-element')).toBeInTheDocument())
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Morada/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Cidade/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Código postal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIF \/ NIPC/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reservar agora/i })).toBeInTheDocument()
  })

  it('shows error state with retry button when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    render(<StripePaymentForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument())
  })

  it('calls update endpoint then confirmCardPayment with billing details on submit', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) }) // PI creation
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // update endpoint
      .mockResolvedValueOnce({ ok: true }) // reservation-complete
    mockConfirmCardPayment.mockResolvedValueOnce({ error: null })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Email/i), 'joao@email.com')
    await userEvent.type(screen.getByLabelText(/Telemóvel/i), '912345678')
    await userEvent.selectOptions(screen.getByLabelText(/Distrito/i), 'LISBOA')
    await userEvent.selectOptions(screen.getByLabelText(/Concessionário/i), 'NI00130004')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByRole('textbox', { name: /Cidade/i }), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))

    // Second fetch is the update endpoint — body includes taxId plus blank optional fields
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/api/payment-intent/update',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"taxId":"123456789"'),
      }),
    )

    // confirmCardPayment receives billing_details
    expect(mockConfirmCardPayment).toHaveBeenCalledWith(
      CLIENT_SECRET,
      expect.objectContaining({
        payment_method: expect.objectContaining({
          billing_details: expect.objectContaining({
            name: 'João Silva',
            address: expect.objectContaining({
              line1: 'Rua das Flores 1',
              city: 'Lisboa',
              postal_code: '1000-001',
              country: 'PT',
            }),
          }),
        }),
      }),
    )

    // No error message shown — success path taken (redirect happens in browser, not testable in jsdom)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows error and re-enables button if update endpoint fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: false })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Email/i), 'joao@email.com')
    await userEvent.type(screen.getByLabelText(/Telemóvel/i), '912345678')
    await userEvent.selectOptions(screen.getByLabelText(/Distrito/i), 'LISBOA')
    await userEvent.selectOptions(screen.getByLabelText(/Concessionário/i), 'NI00130004')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByRole('textbox', { name: /Cidade/i }), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(mockConfirmCardPayment).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Reservar agora/i })).not.toBeDisabled()
  })

  it('shows Stripe error message and re-enables button when confirmCardPayment fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
    mockConfirmCardPayment.mockResolvedValueOnce({ error: { message: 'O teu cartão foi recusado.' } })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Email/i), 'joao@email.com')
    await userEvent.type(screen.getByLabelText(/Telemóvel/i), '912345678')
    await userEvent.selectOptions(screen.getByLabelText(/Distrito/i), 'LISBOA')
    await userEvent.selectOptions(screen.getByLabelText(/Concessionário/i), 'NI00130004')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByRole('textbox', { name: /Cidade/i }), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(screen.getByText('O teu cartão foi recusado.')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Reservar agora/i })).not.toBeDisabled()
  })

  it('renders privacy consent checkbox', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeRequired()
  })

  it('renders marketing consent checkbox (optional)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByLabelText(/comunicações de marketing/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comunicações de marketing/i)).not.toBeRequired()
  })

  it('renders the Stripe security badge', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByTestId('card-element'))
    expect(screen.getByText(/Pagamento seguro/i)).toBeInTheDocument()
  })

  it('includes privacyConsent and marketingConsent in the reservation-complete payload', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clientSecret: CLIENT_SECRET }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // update endpoint
      .mockResolvedValueOnce({ ok: true }) // reservation-complete
    mockConfirmCardPayment.mockResolvedValueOnce({ error: null })

    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.type(screen.getByLabelText(/Morada/i), 'Rua das Flores 1')
    await userEvent.type(screen.getByRole('textbox', { name: /Cidade/i }), 'Lisboa')
    await userEvent.type(screen.getByLabelText(/Código postal/i), '1000-001')
    await userEvent.type(screen.getByLabelText(/NIF \/ NIPC/i), '123456789')
    await userEvent.click(screen.getByLabelText(/Li e aceito a Política de Privacidade/i))
    await userEvent.click(screen.getByLabelText(/comunicações de marketing/i))
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))

    const reservationCall = mockFetch.mock.calls[2]
    const sentBody = JSON.parse(reservationCall[1].body)
    expect(sentBody.privacyConsent).toBe(true)
    expect(sentBody.marketingConsent).toBe(true)
  })

  it('blocks submission and shows error when privacy checkbox is not checked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: CLIENT_SECRET }),
    })
    render(<StripePaymentForm />)
    await waitFor(() => screen.getByLabelText(/Nome completo/i))

    await userEvent.type(screen.getByLabelText(/Nome completo/i), 'João Silva')
    await userEvent.click(screen.getByRole('button', { name: /Reservar agora/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/Política de Privacidade/i)
    // fetch should only have been called once (for client secret), not for update/reservation
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
