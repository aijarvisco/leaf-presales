import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

import HighlightCard from '@/components/ui/HighlightCard'

const defaultProps = {
  imageSrc: '/test.jpg',
  imageAlt: 'Test image',
  description: 'Test description text',
  textPosition: 'bottom' as const,
}

describe('HighlightCard', () => {
  it('renders the image', () => {
    render(<HighlightCard {...defaultProps} />)
    expect(screen.getByAltText('Test image')).toBeInTheDocument()
  })

  it('renders a mobile text block with the description', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    // Mobile block has both 'block' and 'md:hidden' classes
    const mobileBlock = container.querySelector('.block.md\\:hidden')
    expect(mobileBlock).toBeInTheDocument()
    expect(mobileBlock).toHaveTextContent('Test description text')
  })

  it('renders a desktop overlay that is hidden on mobile', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    // There are two hidden md:block elements: gradient div + text overlay div.
    // We find them all and verify at least one exists.
    const desktopElements = container.querySelectorAll('.hidden.md\\:block')
    expect(desktopElements.length).toBeGreaterThanOrEqual(1)
  })

  it('desktop overlay contains the description', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    // The text overlay is a div with both hidden md:block AND the absolute position class.
    // It's the second hidden md:block element (after the gradient).
    const desktopOverlays = container.querySelectorAll('.hidden.md\\:block')
    const textOverlay = Array.from(desktopOverlays).find(el => el.textContent?.trim() !== '')
    expect(textOverlay).toBeInTheDocument()
    expect(textOverlay).toHaveTextContent('Test description text')
  })
})
