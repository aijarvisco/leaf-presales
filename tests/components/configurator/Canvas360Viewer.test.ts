const FRAME_COUNT = 120
const SENSITIVITY = 0.45

function wrapFrame(raw: number): number {
  return ((raw % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

function accumulateFrameIndex(current: number, deltaPixels: number): number {
  return current + deltaPixels * SENSITIVITY
}

describe('wrapFrame', () => {
  it('returns 0 for 0', () => {
    expect(wrapFrame(0)).toBe(0)
  })

  it('preserves fractional part', () => {
    expect(wrapFrame(45.3)).toBeCloseTo(45.3)
  })

  it('wraps forward past FRAME_COUNT', () => {
    expect(wrapFrame(120)).toBe(0)
    expect(wrapFrame(120.5)).toBeCloseTo(0.5)
    expect(wrapFrame(121)).toBeCloseTo(1)
  })

  it('wraps backward (negative index)', () => {
    expect(wrapFrame(-1)).toBeCloseTo(119)
    expect(wrapFrame(-0.3)).toBeCloseTo(119.7)
    expect(wrapFrame(-120)).toBe(0)
  })
})

describe('accumulateFrameIndex', () => {
  it('advances by SENSITIVITY * delta pixels', () => {
    expect(accumulateFrameIndex(0, 4)).toBeCloseTo(1)
    expect(accumulateFrameIndex(0, 8)).toBeCloseTo(2)
  })

  it('goes negative on leftward drag', () => {
    expect(accumulateFrameIndex(10, -4)).toBeCloseTo(9)
  })

  it('accumulates across multiple calls', () => {
    let idx = 0
    idx = accumulateFrameIndex(idx, 4)
    idx = accumulateFrameIndex(idx, 4)
    expect(idx).toBeCloseTo(2)
  })
})
