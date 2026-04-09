'use client'
import { useState } from 'react'
import Image from 'next/image'
import { calculateEVSavings, LEAF_KWH_PER_100KM } from '@/lib/savings'

const DEFAULTS = {
  km_per_year: 15000,
  ev_energy_price_per_kwh: 0.15,
  ice_consumption_l_per_100km: 6,
  fuel_price_per_l: 1.90,
}

export default function SavingsCalculator({ onInterested }: { onInterested?: () => void }) {
  const [inputs, setInputs] = useState(DEFAULTS)
  const results = calculateEVSavings(inputs)

  function update(key: keyof typeof DEFAULTS, step: number, min: number, max: number) {
    setInputs((prev) => ({
      ...prev,
      [key]: Math.min(max, Math.max(min, parseFloat((prev[key] + step).toFixed(10)))),
    }))
  }

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-8 p-6 md:px-24 md:py-16 min-h-[85vh]">

      {/* Left column — inputs */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">

        <Stepper
          label="Distância percorrida anual"
          unit="Km"
          display={inputs.km_per_year.toLocaleString('pt-PT')}
          onDecrement={() => update('km_per_year', -500, 1000, 100000)}
          onIncrement={() => update('km_per_year',  500, 1000, 100000)}
        />

        <CostBox label="Custos com Viatura EV" value={results.ev_cost_year} highlight />

        <Stepper
          label="Custo da Eletricidade"
          unit="€ / kWh"
          display={inputs.ev_energy_price_per_kwh.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onDecrement={() => update('ev_energy_price_per_kwh', -0.01, 0.05, 0.50)}
          onIncrement={() => update('ev_energy_price_per_kwh',  0.01, 0.05, 0.50)}
        />

        <div className="flex items-center justify-between text-sm text-[#86868b] px-1">
          <span>Consumo de energia</span>
          <span className="font-medium text-[#0A0A0A]">{LEAF_KWH_PER_100KM} kWh/100 Km</span>
        </div>

        <CostBox label="Custos com Viatura Combustão" value={results.ice_cost_year} />

        <Stepper
          label="Custo do Combustível"
          unit="€ /litro"
          display={inputs.fuel_price_per_l.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          onDecrement={() => update('fuel_price_per_l', -0.05, 0.50, 3.00)}
          onIncrement={() => update('fuel_price_per_l',  0.05, 0.50, 3.00)}
        />

        <Stepper
          label="Consumo de combustível"
          unit="l/100km"
          display={inputs.ice_consumption_l_per_100km.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          onDecrement={() => update('ice_consumption_l_per_100km', -0.5, 3, 15)}
          onIncrement={() => update('ice_consumption_l_per_100km',  0.5, 3, 15)}
        />

        <p className="text-xs text-[#86868b] leading-relaxed pt-2">
          Os valores são meramente indicativos e baseados nos dados introduzidos. O consumo real pode variar consoante o estilo de condução, condições climatéricas e tarifas em vigor.
        </p>

        {onInterested && (
          <button
            onClick={onInterested}
            className="mt-2 w-full bg-[#0A0A0A] hover:bg-[#1c1c1e] text-white font-medium rounded-xl py-3.5 text-sm tracking-[-0.01em] transition-colors cursor-pointer"
          >
            Estou interessado
          </button>
        )}
      </div>

      {/* Right column — results */}
      <div className="flex flex-col items-start gap-4 flex-1 min-w-0">
        <h3 className="text-xl font-medium tracking-[-0.04em] text-[#0A0A0A]">
          Calculador de Poupança
        </h3>

        <p
          className="font-medium tracking-[-0.04em] leading-none text-[#34C759]"
          style={{ fontSize: '48px' }}
        >
          {results.annual_savings.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>
        <p className="text-sm text-[#86868b] -mt-2">Poupança anual</p>

        <div className="flex gap-8">
          <div>
            <p className="text-xl font-medium text-[#0A0A0A] tracking-[-0.03em]">
              {results.monthly_savings.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
            <p className="text-xs text-[#86868b]">Poupança Mensal</p>
          </div>
          <div>
            <p className="text-xl font-medium text-[#0A0A0A] tracking-[-0.03em]">
              {results.savings_per_km.toLocaleString('pt-PT', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} €/km
            </p>
            <p className="text-xs text-[#86868b]">Poupança Km</p>
          </div>
        </div>

        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f5f7]">
          <Image
            src="/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png"
            alt="Nissan Leaf"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stepper({
  label,
  display,
  unit,
  onDecrement,
  onIncrement,
}: {
  label: string
  unit: string
  display: string
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-[#86868b]">{label}</span>
      <div className="flex items-center justify-between border border-[#d2d2d7] rounded-lg px-3 py-2">
        <button
          onClick={onDecrement}
          className="text-[#0A0A0A] text-lg leading-none w-6 h-6 flex items-center justify-center hover:text-[#E8453C] cursor-pointer"
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <span className="text-sm font-medium text-[#0A0A0A]">
          {display} {unit}
        </span>
        <button
          onClick={onIncrement}
          className="text-[#0A0A0A] text-lg leading-none w-6 h-6 flex items-center justify-center hover:text-[#E8453C] cursor-pointer"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

function CostBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="border border-[#d2d2d7] rounded-lg px-4 py-3">
      <p className="text-xs text-[#86868b] mb-1">{label}</p>
      <p
        className="text-2xl font-medium tracking-[-0.03em]"
        style={{ color: highlight ? '#34C759' : '#0A0A0A' }}
      >
        {value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </p>
      <p className="text-xs text-[#86868b]">Custo anual</p>
    </div>
  )
}
