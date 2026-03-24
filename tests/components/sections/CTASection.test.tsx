// tests/components/sections/CTASection.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'

// framer-motion uses browser APIs not available in jsdom
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
  }
})

// StripePaymentForm fetches on mount — mock it to avoid real network calls
jest.mock('@/components/forms/StripePaymentForm', () => ({
  __esModule: true,
  default: () => <div data-testid="stripe-payment-form" />,
}))

import CTASection from '@/components/sections/CTASection'

describe('CTASection', () => {
  it('renders the payment form and contact form side by side', () => {
    render(<CTASection selectedVersion="visia" />)
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()
    // Contact form is present
    expect(screen.getByText(/Preferes falar primeiro/i)).toBeInTheDocument()
    // No redirect button
    expect(screen.queryByRole('button', { name: /Reservar agora/i })).not.toBeInTheDocument()
  })

  it('renders the security note', () => {
    render(<CTASection />)
    expect(screen.getByText(/Pagamento seguro via Stripe/i)).toBeInTheDocument()
  })
})
