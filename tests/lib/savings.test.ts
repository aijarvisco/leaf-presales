import { calculateSavings } from '@/lib/savings'

describe('calculateSavings', () => {
  it('returns zero savings when no fuel spend', () => {
    const result = calculateSavings({ monthlyFuelSpend: 0, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.monthlySavings).toBe(0)
    expect(result.annualSavings).toBe(0)
  })

  it('calculates monthly savings correctly', () => {
    // 150 €/month fuel, 1000 km, Leaf uses ~15 kWh/100km, tariff 0.22
    // Electricity cost = (1000/100) * 15 * 0.22 = 33 €
    // Savings = 150 - 33 = 117 €
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.monthlySavings).toBeCloseTo(117, 0)
  })

  it('calculates annual savings as 12x monthly', () => {
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.annualSavings).toBeCloseTo(result.monthlySavings * 12, 0)
  })

  it('calculates CO2 avoided', () => {
    // 1000 km/month * 12 = 12000 km/year
    // Average combustion car: 120g CO2/km = 1440 kg CO2/year
    const result = calculateSavings({ monthlyFuelSpend: 150, monthlyKm: 1000, electricityTariff: 0.22 })
    expect(result.co2AvoidedKgPerYear).toBeCloseTo(1440, 0)
  })

  it('clamps savings to 0 when electricity is more expensive than fuel', () => {
    const result = calculateSavings({ monthlyFuelSpend: 10, monthlyKm: 5000, electricityTariff: 0.50 })
    expect(result.monthlySavings).toBe(0)
  })
})
