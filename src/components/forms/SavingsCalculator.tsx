'use client'
import { useState } from 'react'
import { calculateSavings } from '@/lib/savings'

const DEFAULT_INPUTS = {
  monthlyFuelSpend: 150,
  monthlyKm: 1000,
  electricityTariff: 0.22,
}

export default function SavingsCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)
  const results = calculateSavings(inputs)

  const set = (key: keyof typeof inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) }))

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">Calcula a tua poupança</h3>
        <p className="text-sm text-text-secondary">
          Compara o custo de conduzir um carro a combustão com o novo Leaf elétrico.
        </p>
      </div>

      <div className="space-y-5">
        <Slider
          label="Gasto mensal em combustível"
          value={inputs.monthlyFuelSpend}
          min={20} max={400} step={10}
          unit="€/mês"
          onChange={set('monthlyFuelSpend')}
        />
        <Slider
          label="Quilómetros por mês"
          value={inputs.monthlyKm}
          min={200} max={5000} step={100}
          unit="km"
          onChange={set('monthlyKm')}
        />
        <Slider
          label="Tarifa de eletricidade"
          value={inputs.electricityTariff}
          min={0.10} max={0.40} step={0.01}
          unit="€/kWh"
          onChange={set('electricityTariff')}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <Result label="Poupança mensal" value={`€${Math.round(results.monthlySavings)}`} />
        <Result label="Poupança anual" value={`€${Math.round(results.annualSavings)}`} />
        <Result label="CO₂ evitado/ano" value={`${Math.round(results.co2AvoidedKgPerYear)} kg`} />
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} onChange={onChange}
        className="w-full accent-accent"
      />
    </div>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-accent">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  )
}
