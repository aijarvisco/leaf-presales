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
  it('renders the payment form', () => {
    render(<CTASection selectedVersion="engage" />)
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument()
  })

  it('renders the section title', () => {
    render(<CTASection selectedVersion="engage" />)
    expect(screen.getByText(/Reserva o teu Leaf hoje/i)).toBeInTheDocument()
  })

  it('renders the security note', () => {
    render(<CTASection />)
    expect(screen.getByText(/Pagamento seguro via Stripe/i)).toBeInTheDocument()
  })

  it('applies --text-h2 CSS variable to the section heading', () => {
    render(<CTASection selectedVersion="engage" />)
    const heading = screen.getByText(/Reserva o teu Leaf hoje/i)
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })
})
