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

  it('applies --text-h2 CSS variable to the heading', () => {
    const { container } = render(<ClosingSection />)
    const heading = container.querySelector('h2')!
    expect(heading.style.fontSize).toBe('var(--text-h2)')
  })

  it('CTA paragraphs have text-base class for mobile', () => {
    const { container } = render(<ClosingSection />)
    const paras = container.querySelectorAll('p.text-base')
    // Both CTA card paragraphs should have text-base
    expect(paras.length).toBeGreaterThanOrEqual(2)
  })

  it('CTA paragraphs do not use bare text-xl without breakpoint', () => {
    const { container } = render(<ClosingSection />)
    // text-xl without a breakpoint prefix should not appear on these paragraphs
    const barePara = container.querySelector('button p.text-xl:not([class*="sm:text-xl"])')
    expect(barePara).toBeNull()
  })
})
