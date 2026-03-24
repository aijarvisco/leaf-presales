import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/configurator/ConfiguratorViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="configurator-viewer" />,
}))

import Configurator from '@/components/sections/Configurator'

describe('Configurator', () => {
  it('has the hidden class on its root section', () => {
    const { container } = render(<Configurator />)
    expect(container.ownerDocument.getElementById('360view')).toHaveClass('hidden')
  })
})
