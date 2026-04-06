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
    // Desktop overlay has both 'hidden' and 'md:block' classes
    const desktopOverlay = container.querySelector('.hidden.md\\:block')
    expect(desktopOverlay).toBeInTheDocument()
  })

  it('desktop overlay contains the description', () => {
    const { container } = render(<HighlightCard {...defaultProps} />)
    const desktopOverlay = container.querySelector('.hidden.md\\:block')
    expect(desktopOverlay).toHaveTextContent('Test description text')
  })
})
