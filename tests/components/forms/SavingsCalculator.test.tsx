import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import SavingsCalculator from '@/components/forms/SavingsCalculator'

describe('SavingsCalculator', () => {
  it('renders the calculator heading', () => {
    render(<SavingsCalculator />)
    expect(screen.getByText('Calculador de Poupança')).toBeInTheDocument()
  })

  it('savings column appears before inputs column in the DOM', () => {
    const { container } = render(<SavingsCalculator />)
    const savingsCol = container.querySelector('.order-1')
    const inputsCol = container.querySelector('.order-2')
    expect(savingsCol).toBeInTheDocument()
    expect(inputsCol).toBeInTheDocument()
    // Savings column should come first in the DOM
    const allOrderedCols = container.querySelectorAll('.order-1, .order-2')
    expect(allOrderedCols[0]).toBe(savingsCol)
    expect(allOrderedCols[1]).toBe(inputsCol)
  })

  it('car image is hidden on mobile', () => {
    const { container } = render(<SavingsCalculator />)
    const imageWrapper = container.querySelector('.hidden.md\\:block')
    expect(imageWrapper).toBeInTheDocument()
  })

  it('renders the annual savings value', () => {
    const { container } = render(<SavingsCalculator />)
    // Default: 15000km/yr, 0.15€/kWh, 6l/100km, 1.90€/l
    // EV cost: 15000 * (15/100) * 0.15 = 337.50€
    // ICE cost: 15000 * (6/100) * 1.90 = 1710€
    // Savings: 1710 - 337.50 = 1372.50€
    // Note: pt-PT locale and text split across nodes — check combined text content
    const savingsP = container.querySelector('.order-1 p.text-\\[\\#34C759\\]') ??
      Array.from(container.querySelectorAll('p')).find(el =>
        el.textContent?.replace(/\s+/g, ' ').trim().includes('1372,50')
      )
    expect(savingsP).toBeInTheDocument()
    expect(savingsP?.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/1372,50/)
  })

  it('renders the "Estou interessado" button when onInterested is provided', () => {
    const onInterested = jest.fn()
    render(<SavingsCalculator onInterested={onInterested} />)
    expect(screen.getByRole('button', { name: /estou interessado/i })).toBeInTheDocument()
  })
})
