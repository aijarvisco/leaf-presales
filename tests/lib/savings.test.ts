import { calculateEVSavings } from '@/lib/savings'

describe('calculateEVSavings', () => {
  const base = {
    km_per_year: 15000,
    ev_energy_price_per_kwh: 0.15,
    ice_consumption_l_per_100km: 6,
    fuel_price_per_l: 1.90,
  }

  it('returns all zeros when km_per_year is 0', () => {
    const result = calculateEVSavings({ ...base, km_per_year: 0 })
    expect(result.ev_cost_year).toBe(0)
    expect(result.ice_cost_year).toBe(0)
    expect(result.annual_savings).toBe(0)
    expect(result.monthly_savings).toBe(0)
    expect(result.savings_per_km).toBe(0)
  })

  it('calculates ev_cost_year correctly', () => {
    // (15000/100) * 15 * 0.15 = 337.50
    const result = calculateEVSavings(base)
    expect(result.ev_cost_year).toBe(337.50)
  })

  it('calculates ice_cost_year correctly', () => {
    // (15000/100) * 6 * 1.90 = 1710.00
    const result = calculateEVSavings(base)
    expect(result.ice_cost_year).toBe(1710.00)
  })

  it('calculates annual_savings correctly', () => {
    // 1710.00 - 337.50 = 1372.50
    const result = calculateEVSavings(base)
    expect(result.annual_savings).toBe(1372.50)
  })

  it('calculates monthly_savings correctly', () => {
    // 1372.50 / 12 = 114.375 → rounded to 2dp = 114.38
    const result = calculateEVSavings(base)
    expect(result.monthly_savings).toBe(114.38)
  })

  it('calculates savings_per_km correctly', () => {
    // 1372.50 / 15000 = 0.0915 → rounded to 4dp = 0.0915
    const result = calculateEVSavings(base)
    expect(result.savings_per_km).toBe(0.0915)
  })

  it('applies adjustment factors when provided', () => {
    // driving=1.1, temperature=1, load=1
    // adjusted_ev  = 15 * 1.1 = 16.5
    // adjusted_ice = 6 * 1.1 = 6.6
    // ev_cost  = (15000/100) * 16.5 * 0.15 = 371.25
    // ice_cost = (15000/100) * 6.6 * 1.90 = 1881.00
    const result = calculateEVSavings({
      ...base,
      adjustment_factors: { driving: 1.1 },
    })
    expect(result.ev_cost_year).toBe(371.25)
    expect(result.ice_cost_year).toBe(1881.00)
  })

  it('defaults missing adjustment factors to 1', () => {
    const withEmpty = calculateEVSavings({ ...base, adjustment_factors: {} })
    const withNone = calculateEVSavings(base)
    expect(withEmpty.annual_savings).toBe(withNone.annual_savings)
  })

  it('rounds costs to 2 decimal places', () => {
    // Use values that produce fractional cents
    const result = calculateEVSavings({
      km_per_year: 10000,
      ev_energy_price_per_kwh: 0.13,
      ice_consumption_l_per_100km: 7,
      fuel_price_per_l: 1.87,
    })
    expect(result.ev_cost_year).toBe(195.00)   // (10000/100)*15*0.13 = 195.00
    expect(result.ice_cost_year).toBe(1309.00)  // (10000/100)*7*1.87 = 1309.00
  })

  it('rounds savings_per_km to 4 decimal places', () => {
    const result = calculateEVSavings({
      km_per_year: 12000,
      ev_energy_price_per_kwh: 0.15,
      ice_consumption_l_per_100km: 6,
      fuel_price_per_l: 1.90,
    })
    // ev_cost  = (12000/100)*15*0.15 = 270.00
    // ice_cost = (12000/100)*6*1.90  = 1368.00
    // annual   = 1098.00
    // per_km   = 1098/12000 = 0.0915
    expect(result.savings_per_km).toBe(0.0915)
  })
})
