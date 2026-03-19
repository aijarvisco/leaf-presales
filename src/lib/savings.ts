import type { SavingsInputs, SavingsResult } from '@/types'

const LEAF_KWH_PER_100KM = 15       // Nissan Leaf average consumption
const CO2_G_PER_KM_COMBUSTION = 120 // Average petrol car

export function calculateSavings(inputs: SavingsInputs): SavingsResult {
  const { monthlyFuelSpend, monthlyKm, electricityTariff } = inputs

  const monthlyElectricityCost = (monthlyKm / 100) * LEAF_KWH_PER_100KM * electricityTariff
  const monthlySavings = Math.max(0, monthlyFuelSpend - monthlyElectricityCost)
  const annualSavings = monthlySavings * 12
  const co2AvoidedKgPerYear = (monthlyKm * 12 * CO2_G_PER_KM_COMBUSTION) / 1000

  return { monthlySavings, annualSavings, co2AvoidedKgPerYear }
}
