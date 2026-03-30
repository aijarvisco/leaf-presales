import {
  TRIM_LEVELS,
  COLOR_OPTIONS,
  getEffectivePrice,
  type TrimLevel,
} from '@/components/configurator/configuradorData'

describe('TRIM_LEVELS', () => {
  it('has exactly 3 trims', () => {
    expect(TRIM_LEVELS).toHaveLength(3)
  })

  it('trims have ids engage, advance, evolve in order', () => {
    expect(TRIM_LEVELS.map(t => t.id)).toEqual(['engage', 'advance', 'evolve'])
  })

  it('only Engage has batteryOptions', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    expect(engage.batteryOptions).toBeDefined()
    expect(advance.batteryOptions).toBeUndefined()
    expect(evolve.batteryOptions).toBeUndefined()
  })

  it('Engage has 52 kWh and 75 kWh battery options', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    expect(engage.batteryOptions!.map(b => b.kWh)).toEqual([52, 75])
  })

  it('Advance and Evolve have a fixed price', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    expect(advance.price).toBe(49100)
    expect(evolve.price).toBe(51600)
  })

  it('Advance is marked isPopular', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    expect(advance.isPopular).toBe(true)
  })

  it('each trim has at least one highlight', () => {
    TRIM_LEVELS.forEach(t => {
      expect(t.highlights.length).toBeGreaterThan(0)
    })
  })

  it('each trim has at least one availableColorId', () => {
    TRIM_LEVELS.forEach(t => {
      expect(t.availableColorIds.length).toBeGreaterThan(0)
    })
  })

  it('Engage colors are single-tone only', () => {
    const engage = TRIM_LEVELS.find(t => t.id === 'engage')!
    engage.availableColorIds.forEach(id => {
      const color = COLOR_OPTIONS.find(c => c.id === id)!
      expect(color.type).toBe('single-tone')
    })
  })

  it('Advance and Evolve colors are two-tone only', () => {
    const advance = TRIM_LEVELS.find(t => t.id === 'advance')!
    const evolve = TRIM_LEVELS.find(t => t.id === 'evolve')!
    ;[...advance.availableColorIds, ...evolve.availableColorIds].forEach(id => {
      const color = COLOR_OPTIONS.find(c => c.id === id)!
      expect(color.type).toBe('two-tone')
    })
  })
})

describe('COLOR_OPTIONS', () => {
  it('has 10 colors total (4 single-tone + 6 two-tone)', () => {
    const singleTone = COLOR_OPTIONS.filter(c => c.type === 'single-tone')
    const twoTone    = COLOR_OPTIONS.filter(c => c.type === 'two-tone')
    expect(singleTone).toHaveLength(4)
    expect(twoTone).toHaveLength(6)
  })

  it('every color has id, name, hex, colorCode, imageSrc', () => {
    COLOR_OPTIONS.forEach(c => {
      expect(c.id).toBeTruthy()
      expect(c.name).toBeTruthy()
      expect(c.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(c.colorCode).toBeTruthy()
      expect(c.imageSrc).toMatch(/^\/images\//)
    })
  })
})

describe('getEffectivePrice', () => {
  const engage = TRIM_LEVELS.find(t => t.id === 'engage')! as TrimLevel
  const advance = TRIM_LEVELS.find(t => t.id === 'advance')! as TrimLevel
  const evolve  = TRIM_LEVELS.find(t => t.id === 'evolve')!  as TrimLevel

  it('returns 39900 for Engage 52 kWh', () => {
    expect(getEffectivePrice(engage, 52)).toBe(39900)
  })

  it('returns 43300 for Engage 75 kWh', () => {
    expect(getEffectivePrice(engage, 75)).toBe(43300)
  })

  it('defaults to 75 kWh when batteryKwh is omitted for Engage', () => {
    expect(getEffectivePrice(engage)).toBe(43300)
  })

  it('returns 49100 for Advance', () => {
    expect(getEffectivePrice(advance)).toBe(49100)
  })

  it('returns 51600 for Evolve', () => {
    expect(getEffectivePrice(evolve)).toBe(51600)
  })
})
