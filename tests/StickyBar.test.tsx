import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StickyBar from '@/components/configurator/StickyBar'

describe('StickyBar', () => {
  const defaultProps = {
    versionName: 'N-Connecta',
    price: 34490,
    onReserve: jest.fn(),
  }

  it('renders the model and version name', () => {
    render(<StickyBar {...defaultProps} />)
    expect(screen.getByText('Nissan Leaf')).toBeInTheDocument()
    expect(screen.getAllByText('N-Connecta')).toHaveLength(2) // desktop and mobile
  })

  it('renders the price formatted in Portuguese locale', () => {
    render(<StickyBar {...defaultProps} />)
    expect(screen.getAllByText(/34/)).toHaveLength(2) // desktop and mobile
  })

  it('calls onReserve when the CTA button is clicked', () => {
    const onReserve = jest.fn()
    render(<StickyBar {...defaultProps} onReserve={onReserve} />)
    fireEvent.click(screen.getAllByRole('button', { name: /reservar/i })[0])
    expect(onReserve).toHaveBeenCalledTimes(1)
  })

  it('updates when version changes', () => {
    const { rerender } = render(<StickyBar {...defaultProps} />)
    rerender(<StickyBar {...defaultProps} versionName="Tekna" price={38990} />)
    expect(screen.getAllByText('Tekna')).toHaveLength(2) // desktop and mobile
  })
})
