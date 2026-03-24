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
  it('renders the payment form and FAQ accordion', () => {
    render(<CTASection selectedVersion="visia" />)
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()
    // Section title is present
    expect(screen.getByText(/Reserva o teu Leaf hoje/i)).toBeInTheDocument()
    // FAQ questions are rendered
    expect(screen.getByText(/O depósito é reembolsável/i)).toBeInTheDocument()
  })

  it('renders the security note', () => {
    render(<CTASection />)
    expect(screen.getByText(/Pagamento seguro via Stripe/i)).toBeInTheDocument()
  })
})
