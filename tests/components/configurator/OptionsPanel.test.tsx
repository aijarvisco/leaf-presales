import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import OptionsPanel from '@/components/configurator/OptionsPanel'

const defaultProps = {
  selectedTrimId: 'engage',
  selectedColorId: 'PEARL_WHITE',
  selectedBatteryKwh: 75 as 52 | 75,
  onSelectTrim: jest.fn(),
  onSelectColor: jest.fn(),
  onSelectBattery: jest.fn(),
}

describe('OptionsPanel — trim selector', () => {
  it('renders 3 trim buttons: Engage, Advance, Evolve', () => {
    render(<OptionsPanel {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /engage/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /advance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /evolve/i })).toBeInTheDocument()
  })

  it('marks the selected trim as aria-selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByRole('tab', { name: /advance/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /engage/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onSelectTrim with the correct id when a trim is clicked', () => {
    const onSelectTrim = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectTrim={onSelectTrim} />)
    fireEvent.click(screen.getByRole('tab', { name: /evolve/i }))
    expect(onSelectTrim).toHaveBeenCalledWith('evolve')
  })
})

describe('OptionsPanel — battery selector', () => {
  it('shows battery selector when Engage is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" />)
    expect(screen.getByText('52 kWh')).toBeInTheDocument()
    expect(screen.getByText('75 kWh')).toBeInTheDocument()
  })

  it('hides battery selector when Advance is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.queryByText('52 kWh')).not.toBeInTheDocument()
    expect(screen.queryByText('75 kWh')).not.toBeInTheDocument()
  })

  it('hides battery selector when Evolve is selected', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="evolve" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.queryByText('52 kWh')).not.toBeInTheDocument()
  })

  it('calls onSelectBattery when a battery option is clicked', () => {
    const onSelectBattery = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectBattery={onSelectBattery} />)
    fireEvent.click(screen.getByText('52 kWh'))
    expect(onSelectBattery).toHaveBeenCalledWith(52)
  })
})

describe('OptionsPanel — color filtering', () => {
  it('shows only single-tone colors for Engage', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" selectedColorId="PEARL_WHITE" />)
    expect(screen.getByRole('radio', { name: /pearl white$/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /midnight black/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /skyline grey$/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /fuji sunset red$/i })).toBeInTheDocument()
    // Two-tone must NOT appear
    expect(screen.queryByRole('radio', { name: /black roof/i })).not.toBeInTheDocument()
  })

  it('shows only two-tone colors for Advance', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getAllByRole('radio', { name: /black roof/i }).length).toBe(6)
    // Single-tone must NOT appear
    expect(screen.queryByRole('radio', { name: /midnight black/i })).not.toBeInTheDocument()
  })

  it('calls onSelectColor when a color is clicked', () => {
    const onSelectColor = jest.fn()
    render(<OptionsPanel {...defaultProps} onSelectColor={onSelectColor} />)
    fireEvent.click(screen.getByRole('radio', { name: /midnight black/i }))
    expect(onSelectColor).toHaveBeenCalledWith('MIDNIGHT_BLACK')
  })
})

describe('OptionsPanel — highlights', () => {
  it('renders Engage highlights', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="engage" />)
    expect(screen.getByText('ProPILOT Assist com Navi-link')).toBeInTheDocument()
  })

  it('renders Advance highlights with "Tudo da versão Engage +" header', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="advance" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByText(/tudo da versão engage/i)).toBeInTheDocument()
    expect(screen.getByText('Tejadilho panorâmico escurecido')).toBeInTheDocument()
  })

  it('renders Evolve highlights with "Tudo da versão Advance +" header', () => {
    render(<OptionsPanel {...defaultProps} selectedTrimId="evolve" selectedColorId="PEARL_WHITE_BLACK_ROOF" />)
    expect(screen.getByText(/tudo da versão advance/i)).toBeInTheDocument()
    expect(screen.getByText('Jantes de liga leve 19"')).toBeInTheDocument()
  })
})
