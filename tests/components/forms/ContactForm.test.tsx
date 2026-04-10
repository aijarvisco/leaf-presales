import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ContactForm from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('name fields grid has grid-cols-1 for mobile layout', () => {
    const { container } = render(<ContactForm />)
    expect(container.querySelector('.grid-cols-1')).toBeInTheDocument()
  })

  it('name fields grid has md:grid-cols-2 for tablet+ layout', () => {
    const { container } = render(<ContactForm />)
    expect(container.querySelector('.grid-cols-1.md\\:grid-cols-2')).toBeInTheDocument()
  })

  it('renders privacy checkbox with updated copy', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeInTheDocument()
  })

  it('renders marketing consent checkbox', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/comunicações de marketing/i)).toBeInTheDocument()
  })

  it('privacy checkbox is required', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/Li e aceito a Política de Privacidade/i)).toBeRequired()
  })

  it('marketing checkbox is not required', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/comunicações de marketing/i)).not.toBeRequired()
  })

  it('clicking privacy checkbox checks it', async () => {
    render(<ContactForm />)
    const checkbox = screen.getByLabelText(/Li e aceito a Política de Privacidade/i)
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('marketing consent checkbox is unchecked by default', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/comunicações de marketing/i)).not.toBeChecked()
  })
})
