import type { EVSavingsInputs, EVSavingsResult } from '@/types'

export const LEAF_KWH_PER_100KM = 15

export function calculateEVSavings(inputs: EVSavingsInputs): EVSavingsResult {
  const { km_per_year, ev_energy_price_per_kwh, ice_consumption_l_per_100km, fuel_price_per_l } = inputs

  if (km_per_year === 0) {
    return { ev_cost_year: 0, ice_cost_year: 0, annual_savings: 0, monthly_savings: 0, savings_per_km: 0 }
  }

  const driving     = inputs.adjustment_factors?.driving     ?? 1
  const temperature = inputs.adjustment_factors?.temperature ?? 1
  const load        = inputs.adjustment_factors?.load        ?? 1

  const adjusted_ev_consumption  = LEAF_KWH_PER_100KM * driving * temperature * load
  const adjusted_ice_consumption = ice_consumption_l_per_100km * driving * temperature * load

  const ev_cost_year  = round2((km_per_year / 100) * adjusted_ev_consumption  * ev_energy_price_per_kwh)
  const ice_cost_year = round2((km_per_year / 100) * adjusted_ice_consumption * fuel_price_per_l)

  const annual_savings  = round2(ice_cost_year - ev_cost_year)
  const monthly_savings = round2(annual_savings / 12)
  const savings_per_km  = round4(annual_savings / km_per_year)

  return { ev_cost_year, ice_cost_year, annual_savings, monthly_savings, savings_per_km }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
