# 360 Viewer Smooth Sub-frame Interpolation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate jumpy frame transitions in the 360 viewer by blending adjacent frames with canvas alpha compositing.

**Architecture:** Remove `Math.round()` from `wrapFrame` so it returns floats. Rewrite `drawFrame` to split a float index into floor/ceil and alpha-blend two images. Tune sensitivity, damping, and velocity threshold for smoother feel.

**Tech Stack:** React, Canvas 2D API, Jest

**Spec:** `docs/superpowers/specs/2026-03-20-360-viewer-smooth-interpolation.md`

---

### Task 1: Update tests — `wrapFrame` becomes float-based

**Files:**
- Modify: `tests/components/configurator/Canvas360Viewer.test.ts`

- [ ] **Step 1: Rewrite the `wrapFrame` function and tests in the test file**

Update constants and remove `Math.round()` from the local `wrapFrame` copy. Replace all test cases with float-based expectations. Remove the rounding test.

```typescript
const FRAME_COUNT = 120
const SENSITIVITY = 0.45

function wrapFrame(raw: number): number {
  return ((raw % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}
```

Replace the `describe('wrapFrame', ...)` block with:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx jest tests/components/configurator/Canvas360Viewer.test.ts --verbose`
Expected: All `wrapFrame` tests PASS. The `accumulateFrameIndex` tests will FAIL (still using old SENSITIVITY).

- [ ] **Step 3: Commit**

```bash
git add tests/components/configurator/Canvas360Viewer.test.ts
git commit -m "test: update wrapFrame tests for float-based wrapping with FRAME_COUNT=120"
```

---

### Task 2: Update tests — `accumulateFrameIndex` with new SENSITIVITY

**Files:**
- Modify: `tests/components/configurator/Canvas360Viewer.test.ts`

- [ ] **Step 1: Update the `accumulateFrameIndex` test expectations**

The SENSITIVITY constant was already changed to 0.45 in Task 1. Now update the test expectations to match:

```typescript
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
```

- [ ] **Step 2: Run all tests to verify they pass**

Run: `npx jest tests/components/configurator/Canvas360Viewer.test.ts --verbose`
Expected: ALL tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/components/configurator/Canvas360Viewer.test.ts
git commit -m "test: update accumulateFrameIndex tests for SENSITIVITY=0.45"
```

---

### Task 3: Update constants in the component

**Files:**
- Modify: `src/components/configurator/Canvas360Viewer.tsx:5-7`

- [ ] **Step 1: Update the three constants**

Change lines 5-7 from:

```typescript
const SENSITIVITY = 0.25         // frames per pixel dragged
const DAMPING = 0.92             // velocity decay per rAF frame
const VELOCITY_THRESHOLD = 0.005 // px/ms — inertia stops below this
```

To:

```typescript
const SENSITIVITY = 0.45         // frames per pixel dragged
const DAMPING = 0.95             // velocity decay per rAF frame
const VELOCITY_THRESHOLD = 0.001 // px/ms — inertia stops below this
```

- [ ] **Step 2: Commit**

```bash
git add src/components/configurator/Canvas360Viewer.tsx
git commit -m "feat: tune sensitivity, damping, and velocity threshold for smoother 360 rotation"
```

---

### Task 4: Make `wrapFrame` float-based in the component

**Files:**
- Modify: `src/components/configurator/Canvas360Viewer.tsx:17-19`

- [ ] **Step 1: Remove `Math.round()` from `wrapFrame`**

Change line 17-19 from:

```typescript
function wrapFrame(raw: number): number {
  return ((Math.round(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}
```

To:

```typescript
function wrapFrame(raw: number): number {
  return ((raw % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/configurator/Canvas360Viewer.tsx
git commit -m "feat: make wrapFrame return floats for sub-frame interpolation"
```

---

### Task 5: Rewrite `drawFrame` with alpha blending

**Files:**
- Modify: `src/components/configurator/Canvas360Viewer.tsx:38-46`

- [ ] **Step 1: Replace the `drawFrame` function**

Replace the current `drawFrame` (lines 38-46) with the alpha-blending version. This function expects a pre-wrapped float in `[0, FRAME_COUNT)`:

```typescript
  // Draw frame with sub-frame interpolation via alpha blending.
  // Expects a pre-wrapped float in [0, FRAME_COUNT).
  const drawFrame = (floatIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const floor = Math.floor(floatIndex) % FRAME_COUNT
    const ceil = (floor + 1) % FRAME_COUNT
    const t = floatIndex - Math.floor(floatIndex)

    const imgA = imagesRef.current[floor]
    const imgB = imagesRef.current[ceil]
    if (!imgA) return

    ctx.globalAlpha = 1.0
    ctx.drawImage(imgA, 0, 0, canvas.width, canvas.height)

    if (t > 0.001 && imgB) {
      ctx.globalAlpha = t
      ctx.drawImage(imgB, 0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1.0
    }
  }
```

- [ ] **Step 2: Verify the app compiles and runs**

Run: `npx next build` or start dev server and visually test drag rotation in the browser.
Expected: Dragging the 360 viewer now produces smooth, blended frame transitions instead of jumpy snaps.

- [ ] **Step 3: Run all tests**

Run: `npx jest tests/components/configurator/Canvas360Viewer.test.ts --verbose`
Expected: ALL tests PASS (tests only cover `wrapFrame` and `accumulateFrameIndex` — both pure functions unchanged by this step).

- [ ] **Step 4: Commit**

```bash
git add src/components/configurator/Canvas360Viewer.tsx
git commit -m "feat: add sub-frame alpha blending to drawFrame for smooth 360 rotation"
```

---

### Task 6: Visual verification

This task is manual — no code changes.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify smooth rotation**

Open the configurator section in the browser. Test:
1. **Slow drag** — should blend smoothly between adjacent frames, no jumps
2. **Fast drag** — should advance multiple frames fluidly
3. **Inertia after release** — should coast smoothly and gradually decelerate
4. **Wrap-around** — drag past frame 119 back to frame 0, should blend seamlessly
5. **Resize** — resize the window, viewer should redraw correctly

- [ ] **Step 3: Verify exterior/interior toggle still works**

Switch between exterior and interior views. Crossfade should be unaffected.
