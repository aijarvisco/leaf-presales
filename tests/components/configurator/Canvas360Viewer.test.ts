const FRAME_COUNT = 120
const SENSITIVITY = 0.45

function wrapFrame(raw: number): number {
  return ((Math.floor(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

function accumulateFrameIndex(current: number, deltaPixels: number): number {
  return current + deltaPixels * SENSITIVITY
}

describe('wrapFrame', () => {
  it('returns 0 for 0', () => {
    expect(wrapFrame(0)).toBe(0)
  })

  it('floors fractional input', () => {
    expect(wrapFrame(0.4)).toBe(0)
    expect(wrapFrame(0.9)).toBe(0)
    expect(wrapFrame(45.7)).toBe(45)
  })

  it('wraps forward past FRAME_COUNT', () => {
    expect(wrapFrame(120)).toBe(0)
    expect(wrapFrame(121)).toBe(1)
    expect(wrapFrame(121.5)).toBe(1)
  })

  it('wraps backward (negative index)', () => {
    expect(wrapFrame(-1)).toBe(119)
    expect(wrapFrame(-0.3)).toBe(119)
    expect(wrapFrame(-120)).toBe(0)
  })
})

describe('accumulateFrameIndex', () => {
  it('advances by SENSITIVITY * delta pixels', () => {
    expect(accumulateFrameIndex(0, 10)).toBeCloseTo(4.5)
    expect(accumulateFrameIndex(0, 20)).toBeCloseTo(9)
  })

  it('goes negative on leftward drag', () => {
    expect(accumulateFrameIndex(10, -10)).toBeCloseTo(5.5)
  })

  it('accumulates across multiple calls', () => {
    let idx = 0
    idx = accumulateFrameIndex(idx, 10)
    idx = accumulateFrameIndex(idx, 10)
    expect(idx).toBeCloseTo(9)
  })
})
