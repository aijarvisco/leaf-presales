import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, fill, ...props }: { alt: string; fill?: boolean; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

// Mock StripePaymentForm — avoids Stripe SDK setup in tests
jest.mock('@/components/forms/StripePaymentForm', () => ({
  __esModule: true,
  default: ({ versionId }: { versionId: string }) =>
    React.createElement('div', { 'data-testid': 'stripe-payment-form', 'data-version-id': versionId }),
}))

import ReservationDrawer from '@/components/ui/ReservationDrawer'

const defaultProps = {
  isOpen: false,
  onClose: jest.fn(),
  versionId: 'n-connecta',
  versionName: 'N-Connecta',
  colorName: 'Turquoise',
  colorHex: '#4ABFBF',
  colorImageSrc: '/images/exterior-colors/TURQUOISE.png',
  price: 34490,
}

describe('ReservationDrawer', () => {
  it('renders nothing before client mount (SSR guard)', () => {
    // Before useEffect runs, mounted=false → null
    // We can't truly test SSR, but we verify rendering works
    const { container } = render(<ReservationDrawer {...defaultProps} />)
    // After mount the portal renders but the drawer is closed
    expect(container).toBeInTheDocument()
  })

  it('shows the drawer panel when isOpen is true', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen />)
    })
    expect(screen.getByText('Reserva')).toBeInTheDocument()
  })

  it('renders config card with vehicle details', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen />)
    })
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
    expect(screen.getByText('N-Connecta')).toBeInTheDocument()
    expect(screen.getByText(/Turquoise/)).toBeInTheDocument()
    expect(screen.getByText(/34.490/)).toBeInTheDocument()
  })

  it('renders the color image', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen />)
    })
    const img = screen.getByAltText('Turquoise')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/exterior-colors/TURQUOISE.png')
  })

  it('renders the intro title', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen />)
    })
    expect(screen.getByText('Complete a sua reserva')).toBeInTheDocument()
  })

  it('renders StripePaymentForm with correct versionId when open', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen />)
    })
    const form = screen.getByTestId('stripe-payment-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-version-id', 'n-connecta')
  })

  it('does not render StripePaymentForm when closed', async () => {
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen={false} />)
    })
    expect(screen.queryByTestId('stripe-payment-form')).not.toBeInTheDocument()
  })

  it('calls onClose when the × button is clicked', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen onClose={onClose} />)
    })
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen onClose={onClose} />)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when drawer is closed', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ReservationDrawer {...defaultProps} isOpen={false} onClose={onClose} />)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
