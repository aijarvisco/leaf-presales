import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import ContactForm from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('name fields grid has grid-cols-1 for mobile layout', () => {
    const { container } = render(<ContactForm />)
    const grid = container.querySelector('.grid-cols-1')
    expect(grid).toBeInTheDocument()
  })

  it('name fields grid has md:grid-cols-2 for tablet+ layout', () => {
    const { container } = render(<ContactForm />)
    // class "md:grid-cols-2" contains a colon — escape it in the selector
    const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})
