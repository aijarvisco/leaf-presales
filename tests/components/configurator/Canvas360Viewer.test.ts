const FRAME_COUNT = 104
const SENSITIVITY = 0.25

function wrapFrame(raw: number): number {
  return ((Math.round(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

function accumulateFrameIndex(current: number, deltaPixels: number): number {
  return current + deltaPixels * SENSITIVITY
}

describe('wrapFrame', () => {
  it('returns 0 for 0', () => {
    expect(wrapFrame(0)).toBe(0)
  })

  it('wraps forward past FRAME_COUNT', () => {
    expect(wrapFrame(104)).toBe(0)
    expect(wrapFrame(105)).toBe(1)
  })

  it('wraps backward (negative index)', () => {
    expect(wrapFrame(-1)).toBe(103)
    expect(wrapFrame(-104)).toBe(0)
  })

  it('handles floating point input by rounding', () => {
    expect(wrapFrame(0.4)).toBe(0)
    expect(wrapFrame(0.6)).toBe(1)
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
