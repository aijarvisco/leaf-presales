import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

import Modal from '@/components/ui/Modal'

describe('Modal (bottom-sheet)', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
    document.body.style.overflow = ''
  })

  it('renders children when open', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Calculator content</p></Modal>)
    })
    expect(screen.getByText('Calculator content')).toBeInTheDocument()
  })

  it('renders nothing when closed', async () => {
    await act(async () => {
      render(<Modal open={false} onClose={onClose}><p>Calculator content</p></Modal>)
    })
    expect(screen.queryByText('Calculator content')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when closed', async () => {
    await act(async () => {
      render(<Modal open={false} onClose={onClose}><p>Content</p></Modal>)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll when open', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('panel has white background class', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    const panel = screen.getByTestId('modal-panel')
    expect(panel.className).toContain('bg-white')
  })

  it('panel has rounded-t-2xl class', async () => {
    await act(async () => {
      render(<Modal open onClose={onClose}><p>Content</p></Modal>)
    })
    const panel = screen.getByTestId('modal-panel')
    expect(panel.className).toContain('rounded-t-2xl')
  })
})
