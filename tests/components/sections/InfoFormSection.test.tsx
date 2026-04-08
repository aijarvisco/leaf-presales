import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => <img alt={alt} />,
}))

jest.mock('@/data/concessionarios.json', () => [
  {
    district: 'LISBOA',
    dealers: [
      { designation: 'Dealer A', objectId: 'OBJ001', address: 'Rua X', oidParent: 'P1', commercialName: '', postalCodeDesig: '', municipality: '', postalCode4: 0, postalCode3: 0, gpsX: '', gpsY: '' },
      { designation: 'Dealer B', objectId: 'OBJ002', address: 'GRUPO', oidParent: 'P1', commercialName: '', postalCodeDesig: '', municipality: '', postalCode4: 0, postalCode3: 0, gpsX: '', gpsY: '' },
    ],
  },
  {
    district: 'PORTO',
    dealers: [
      { designation: 'Dealer C', objectId: 'OBJ003', address: 'Rua Y', oidParent: 'P2', commercialName: '', postalCodeDesig: '', municipality: '', postalCode4: 0, postalCode3: 0, gpsX: '', gpsY: '' },
    ],
  },
])

import InfoFormSection from '@/components/sections/InfoFormSection'

describe('InfoFormSection', () => {
  it('renders the tagline', () => {
    render(<InfoFormSection />)
    expect(screen.getByText('Contacto')).toBeInTheDocument()
  })

  it('renders the section title', () => {
    render(<InfoFormSection />)
    expect(screen.getByText('Fale connosco.')).toBeInTheDocument()
  })

  it('renders the section paragraph', () => {
    render(<InfoFormSection />)
    expect(screen.getByText(/Preencha o formulário/i)).toBeInTheDocument()
  })

  it('renders the CTA image', () => {
    render(<InfoFormSection />)
    expect(screen.getByAltText('Nissan Leaf em condução')).toBeInTheDocument()
  })

  it('concessionário select is disabled before a distrito is chosen', () => {
    render(<InfoFormSection />)
    expect(screen.getByLabelText('Concessionário')).toBeDisabled()
  })

  it('populates distrito options from JSON', () => {
    render(<InfoFormSection />)
    expect(screen.getByRole('option', { name: 'LISBOA' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'PORTO' })).toBeInTheDocument()
  })

  it('enables concessionário select and filters out GRUPO dealers after distrito selection', async () => {
    const user = userEvent.setup()
    render(<InfoFormSection />)
    await user.selectOptions(screen.getByLabelText('Distrito'), 'LISBOA')
    expect(screen.getByLabelText('Concessionário')).not.toBeDisabled()
    expect(screen.getByRole('option', { name: 'Dealer A' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Dealer B' })).not.toBeInTheDocument()
  })

  it('resets concessionário when distrito changes', async () => {
    const user = userEvent.setup()
    render(<InfoFormSection />)
    await user.selectOptions(screen.getByLabelText('Distrito'), 'LISBOA')
    await user.selectOptions(screen.getByLabelText('Concessionário'), 'OBJ001')
    await user.selectOptions(screen.getByLabelText('Distrito'), 'PORTO')
    expect((screen.getByLabelText('Concessionário') as HTMLSelectElement).value).toBe('')
  })

  it('shows success message after successful form submission', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true } as Response)
    const user = userEvent.setup()
    render(<InfoFormSection />)

    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.type(screen.getByLabelText('Telemóvel'), '+351912345678')
    await user.type(screen.getByLabelText('Email'), 'joao@example.com')
    await user.selectOptions(screen.getByLabelText('Distrito'), 'LISBOA')
    await user.selectOptions(screen.getByLabelText('Concessionário'), 'OBJ001')
    await user.click(screen.getByLabelText(/Aceito a Política de Privacidade/i))
    await user.click(screen.getByRole('button', { name: /Enviar/i }))

    expect(await screen.findByText(/Obrigado/i)).toBeInTheDocument()
  })

  it('shows error message when submission fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false } as Response)
    const user = userEvent.setup()
    render(<InfoFormSection />)

    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.type(screen.getByLabelText('Telemóvel'), '+351912345678')
    await user.type(screen.getByLabelText('Email'), 'joao@example.com')
    await user.selectOptions(screen.getByLabelText('Distrito'), 'LISBOA')
    await user.selectOptions(screen.getByLabelText('Concessionário'), 'OBJ001')
    await user.click(screen.getByLabelText(/Aceito a Política de Privacidade/i))
    await user.click(screen.getByRole('button', { name: /Enviar/i }))

    expect(await screen.findByText(/Ocorreu um erro/i)).toBeInTheDocument()
  })
})
