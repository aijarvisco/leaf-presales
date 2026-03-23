import {
  VERSIONS,
  EXTERIOR_COLORS,
  INTERIOR_IMAGES,
  getVersionInclusions,
} from '@/components/configurator/configuradorData'

describe('VERSIONS', () => {
  it('has exactly 3 versions', () => {
    expect(VERSIONS).toHaveLength(3)
  })

  it('version ids are visia, n-connecta, tekna', () => {
    expect(VERSIONS.map(v => v.id)).toEqual(['visia', 'n-connecta', 'tekna'])
  })

  it('all versions have a price > 0', () => {
    VERSIONS.forEach(v => expect(v.price).toBeGreaterThan(0))
  })
})

describe('EXTERIOR_COLORS', () => {
  it('has exactly 6 colours', () => {
    expect(EXTERIOR_COLORS).toHaveLength(6)
  })

  it('no colour id contains a trailing space', () => {
    EXTERIOR_COLORS.forEach(c => expect(c.id).toBe(c.id.trim()))
  })

  it('all imageSrc values use the correct directory', () => {
    EXTERIOR_COLORS.forEach(c =>
      expect(c.imageSrc).toMatch(/^\/images\/exterior-colors\//)
    )
  })
})

describe('INTERIOR_IMAGES', () => {
  it('has 7 images', () => {
    expect(INTERIOR_IMAGES).toHaveLength(7)
  })
})

describe('getVersionInclusions', () => {
  it('visia returns all true features', () => {
    const items = getVersionInclusions('visia')
    items.forEach(item => expect(item.label).toBeTruthy())
  })

  it('n-connecta returns only the delta vs visia', () => {
    const visiaFeatures = VERSIONS[0].features
    const nConnectaItems = getVersionInclusions('n-connecta')
    const deltaLabels = nConnectaItems.map(i => i.label)
    deltaLabels.forEach(label => {
      expect(visiaFeatures[label]).toBe(false)
    })
  })

  it('tekna returns only the delta vs n-connecta', () => {
    const nConnectaFeatures = VERSIONS[1].features
    const teknaItems = getVersionInclusions('tekna')
    teknaItems.forEach(item => {
      expect(nConnectaFeatures[item.label]).toBe(false)
    })
  })

  it('returns empty array for unknown version id', () => {
    expect(getVersionInclusions('unknown')).toEqual([])
  })
})
