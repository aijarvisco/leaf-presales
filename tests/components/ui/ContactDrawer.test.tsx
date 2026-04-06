import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/forms/ContactForm', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'contact-form' }),
}))

import ContactDrawer from '@/components/ui/ContactDrawer'

describe('ContactDrawer', () => {
  it('renders the drawer title when open', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    expect(screen.getByText('Pedir informações')).toBeInTheDocument()
  })

  it('renders the contact form when open', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
  })

  it('scroll body has safe-area bottom padding', async () => {
    await act(async () => {
      render(<ContactDrawer isOpen onClose={jest.fn()} />)
    })
    const bodies = document.querySelectorAll('[class*="overflow-y-auto"]')
    const body = Array.from(bodies).find(el => el.className.includes('safe-area-inset-bottom'))
    expect(body).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ContactDrawer isOpen onClose={onClose} />)
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = jest.fn()
    await act(async () => {
      render(<ContactDrawer isOpen onClose={onClose} />)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
