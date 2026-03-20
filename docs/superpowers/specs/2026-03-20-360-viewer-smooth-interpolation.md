# 360 Viewer Smooth Sub-frame Interpolation

## Problem

The Canvas360Viewer displays jumpy frame transitions when dragging to rotate. The current implementation snaps to integer frame indices using `Math.round()`, causing visible discrete jumps between frames instead of smooth continuous motion.

## Solution

Implement sub-frame interpolation by alpha-blending two adjacent frames on the canvas. When the frame accumulator is a float (e.g., 45.3), draw frame 45 at 70% opacity and frame 46 at 30% opacity. This creates the illusion of continuous motion.

## Scope

All changes are contained within `Canvas360Viewer.tsx` and its test file.

## Design

### 1. Constant Tuning

| Constant | Before | After | Reason |
|----------|--------|-------|--------|
| SENSITIVITY | 0.25 | 0.45 | More responsive to small drags |
| DAMPING | 0.92 | 0.95 | Slower inertia decay, smoother coast |
| VELOCITY_THRESHOLD | 0.005 | 0.001 | Let inertia coast further; sub-frame blending makes tiny movements visible |

### 2. `wrapFrame` Becomes Float-based

Remove `Math.round()`. Return a float in `[0, FRAME_COUNT)`:

```typescript
function wrapFrame(raw: number): number {
  return ((raw % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}
```

### 3. `drawFrame` Accepts a Float

Split the float into floor/ceil indices and blend:

```typescript
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

### 4. Call Sites

All places that call `drawFrame` pass the raw wrapped float instead of a rounded integer:

- `handlePointerMove`: `drawFrame(wrapFrame(frameAccRef.current))`
- `startInertia` step: `drawFrame(wrapFrame(frameAccRef.current))`
- ResizeObserver callback: `drawFrame(wrapFrame(frameAccRef.current))`
- Initial load (frame 0): `drawFrame(0)` (unchanged, integer is fine)

### 5. Preconditions

- `drawFrame` expects a non-negative, pre-wrapped float in `[0, FRAME_COUNT)`. All call sites must pass through `wrapFrame` first.
- All frames are fully opaque photographs — no `clearRect` needed before drawing since each frame covers the entire canvas.

### 6. Test Updates

Update `FRAME_COUNT` from 104 to 120 and `SENSITIVITY` from 0.25 to 0.45.

**`wrapFrame` tests** — now returns floats, no rounding:

```typescript
// Basic
wrapFrame(0)      → 0
wrapFrame(45.3)   → 45.3   // preserves fractional part

// Forward wrap
wrapFrame(120)    → 0
wrapFrame(120.5)  → 0.5
wrapFrame(121)    → 1

// Negative wrap
wrapFrame(-1)     → 119
wrapFrame(-0.3)   → 119.7
wrapFrame(-120)   → 0
```

**`accumulateFrameIndex` tests** — update SENSITIVITY to 0.45:

```typescript
// 1 frame per ~2.2px drag (1/0.45 ≈ 2.22)
accumulateFrameIndex(0, 10)  → 4.5
accumulateFrameIndex(10, -10) → 5.5
```

**Remove the rounding test** (`'handles floating point input by rounding'`) since `wrapFrame` no longer rounds.

## Files Changed

- `src/components/configurator/Canvas360Viewer.tsx`
- `tests/components/configurator/Canvas360Viewer.test.ts`

## What Doesn't Change

- Component hierarchy
- Image loading strategy (all 120 frames preloaded)
- Pointer event handling structure
- Interior/Exterior toggle
- ConfiguratorViewer or Configurator section components
