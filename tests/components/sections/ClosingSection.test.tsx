import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

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
    useScroll: () => ({ scrollYProgress: { on: () => () => {}, get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, output: unknown[]) => output[0],
    useMotionValueEvent: () => {},
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) =>
    React.createElement('img', { alt, ...props }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}))

import ClosingSection from '@/components/sections/ClosingSection'

describe('ClosingSection', () => {
  it('has id="closing" on the root 300vh section', () => {
    const { container } = render(<ClosingSection />)
    expect(container.querySelector('#closing')).toBeInTheDocument()
  })
})
