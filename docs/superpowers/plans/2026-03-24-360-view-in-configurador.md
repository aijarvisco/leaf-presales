# 360° View Integration into Configurador — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the standalone 360° viewer into the Configurador's left image panel behind a "Vista 360" button, hiding the separate `#360view` section.

**Architecture:** Extend `ImageView` type in `ImagePanel.tsx` to include `'360'`. In the non-360 state, a standalone "Vista 360" pill button appears to the left of the existing Exterior/Interior toggle. In the 360 state, `Canvas360Viewer` fills the panel and a "Close" button replaces both pills. In `Configurador.tsx`, a `handleColorSelect` wrapper auto-closes the 360 view when a color swatch is clicked. The standalone `Configurator.tsx` section is hidden with `hidden`.

**Tech Stack:** React, Next.js, TypeScript, Tailwind CSS, Framer Motion, Jest + React Testing Library

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/components/sections/Configurator.tsx` | Modify | Add `hidden` to root `<section>` |
| `src/components/configurator/ImagePanel.tsx` | Modify | Extend type, new bottom controls, 360 view block |
| `src/components/sections/Configurador.tsx` | Modify | Add `handleColorSelect` wrapper |
| `tests/components/sections/Configurator.test.tsx` | Create | Verify `hidden` class |
| `tests/components/configurator/ImagePanel.test.tsx` | Create | All ImagePanel view state tests |
| `tests/Configurador.test.tsx` | Modify | Add Vista 360 and color-auto-close tests |

---

### Task 1: Hide the standalone 360 section

**Files:**
- Create: `tests/components/sections/Configurator.test.tsx`
- Modify: `src/components/sections/Configurator.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/sections/Configurator.test.tsx`:

```tsx
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/configurator/ConfiguratorViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="configurator-viewer" />,
}))

import Configurator from '@/components/sections/Configurator'

describe('Configurator', () => {
  it('has the hidden class on its root section', () => {
    const { container } = render(<Configurator />)
    expect(container.querySelector('#360view')).toHaveClass('hidden')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/components/sections/Configurator.test.tsx --no-coverage
```

Expected: FAIL — `#360view` does not have class `hidden`

- [ ] **Step 3: Add `hidden` to Configurator.tsx**

In `src/components/sections/Configurator.tsx`, line 15, change:

```tsx
<section id="360view" className="relative min-h-screen w-full overflow-hidden">
```

to:

```tsx
<section id="360view" className="hidden relative min-h-screen w-full overflow-hidden">
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/components/sections/Configurator.test.tsx --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Configurator.tsx tests/components/sections/Configurator.test.tsx
git commit -m "feat: hide standalone 360view section"
```

---

### Task 2: Update ImagePanel with Vista 360 button and 360 view state

**Files:**
- Create: `tests/components/configurator/ImagePanel.test.tsx`
- Modify: `src/components/configurator/ImagePanel.tsx`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/configurator/ImagePanel.test.tsx`:

```tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref) =>
            React.createElement(tag, { ...props, ref }, children)
          ),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt, fill, priority, sizes, quality, placeholder, blurDataURL, onLoad, onError, ...props
  }: {
    alt: string; fill?: boolean; priority?: boolean; sizes?: string; quality?: number;
    placeholder?: string; blurDataURL?: string; onLoad?: () => void; onError?: () => void;
    [key: string]: unknown
  }) => React.createElement('img', { alt, ...props }),
}))

// Canvas360Viewer uses canvas APIs not available in jsdom
jest.mock('@/components/configurator/Canvas360Viewer', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-360-viewer" />,
}))

import ImagePanel from '@/components/configurator/ImagePanel'

const baseProps = {
  exteriorImageSrc: '/exterior.jpg',
  view: 'exterior' as const,
  onViewChange: jest.fn(),
  slideIndex: 0,
  onSlideChange: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('ImagePanel — default state (exterior)', () => {
  it('renders the Vista 360 button', () => {
    render(<ImagePanel {...baseProps} />)
    expect(screen.getByRole('button', { name: /vista 360/i })).toBeInTheDocument()
  })

  it('renders the Exterior/Interior toggle', () => {
    render(<ImagePanel {...baseProps} />)
    expect(screen.getByRole('button', { name: /exterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /interior/i })).toBeInTheDocument()
  })

  it('calls onViewChange("360") when Vista 360 is clicked', () => {
    const onViewChange = jest.fn()
    render(<ImagePanel {...baseProps} onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
    expect(onViewChange).toHaveBeenCalledWith('360')
  })
})

describe('ImagePanel — 360 state', () => {
  const props360 = { ...baseProps, view: '360' as const }

  it('renders Canvas360Viewer', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  })

  it('renders the Close button', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('does not render the Exterior/Interior toggle', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.queryByRole('button', { name: /^exterior$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^interior$/i })).not.toBeInTheDocument()
  })

  it('does not render the Vista 360 button', () => {
    render(<ImagePanel {...props360} />)
    expect(screen.queryByRole('button', { name: /vista 360/i })).not.toBeInTheDocument()
  })

  it('calls onViewChange("exterior") when Close is clicked', () => {
    const onViewChange = jest.fn()
    render(<ImagePanel {...props360} onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onViewChange).toHaveBeenCalledWith('exterior')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest tests/components/configurator/ImagePanel.test.tsx --no-coverage
```

Expected: FAIL — Vista 360 button not found, 360 state not implemented

- [ ] **Step 3: Extend ImageView type in ImagePanel.tsx**

In `src/components/configurator/ImagePanel.tsx`, line 7, change:

```ts
type ImageView = 'exterior' | 'interior'
```

to:

```ts
type ImageView = 'exterior' | 'interior' | '360'
```

- [ ] **Step 4: Add Canvas360Viewer import**

At the top of `src/components/configurator/ImagePanel.tsx`, add after the existing imports:

```ts
import Canvas360Viewer from '@/components/configurator/Canvas360Viewer'
```

- [ ] **Step 5: Replace the bottom toggle pill with the new bottom controls**

In `src/components/configurator/ImagePanel.tsx`, replace the entire `{/* Exterior / Interior toggle pill */}` block (lines 158–171) with:

```tsx
      {/* Bottom controls — hidden in 360 view */}
      {view !== '360' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {/* Vista 360 — standalone pill */}
          <button
            onClick={() => onViewChange('360')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.25"/>
              <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke="white" strokeWidth="1.25"/>
              <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="white" strokeWidth="1.25"/>
            </svg>
            Vista 360
          </button>

          {/* Exterior / Interior toggle pill */}
          <div className="flex gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1">
            {(['exterior', 'interior'] as ImageView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                aria-pressed={view === v}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  view === v ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                {v === 'exterior' ? 'Exterior' : 'Interior'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 360 view */}
      <AnimatePresence>
        {view === '360' && (
          <motion.div
            key="360-view"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Canvas360Viewer />

            {/* Drag hint — auto-fades after 2s, pointer-events-none so it doesn't block dragging */}
            <motion.p
              className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap z-20"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              ← Drag to explore →
            </motion.p>

            {/* Close button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => onViewChange('exterior')}
                className="px-8 py-3 rounded-full bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#0A0A0A]/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest tests/components/configurator/ImagePanel.test.tsx --no-coverage
```

Expected: All PASS

- [ ] **Step 7: Run the full test suite to verify no regressions**

```bash
npx jest --no-coverage
```

Expected: All existing tests still pass

- [ ] **Step 8: Commit**

```bash
git add src/components/configurator/ImagePanel.tsx tests/components/configurator/ImagePanel.test.tsx
git commit -m "feat: add Vista 360 button and 360 view state to ImagePanel"
```

---

### Task 3: Auto-close 360 view on color selection in Configurador

**Files:**
- Modify: `src/components/sections/Configurador.tsx`
- Modify: `tests/Configurador.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `tests/Configurador.test.tsx`, add the Canvas360Viewer mock alongside the existing mocks at the top of the file:

```ts
jest.mock('@/components/configurator/Canvas360Viewer', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-360-viewer" />,
}))
```

Then add these three tests inside the existing `describe('Configurador')` block:

```tsx
it('renders the Vista 360 button', () => {
  render(<Configurador onSelectVersion={jest.fn()} />)
  expect(screen.getByRole('button', { name: /vista 360/i })).toBeInTheDocument()
})

it('clicking Vista 360 shows the 360 viewer', () => {
  render(<Configurador onSelectVersion={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
  expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
})

it('clicking a color while in 360 view closes the 360 viewer', () => {
  render(<Configurador onSelectVersion={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /vista 360/i }))
  expect(screen.getByTestId('canvas-360-viewer')).toBeInTheDocument()
  // Click any non-selected color (default is Turquoise, so click Fuji Sunset Red)
  fireEvent.click(screen.getByRole('radio', { name: /fuji sunset red/i }))
  expect(screen.queryByTestId('canvas-360-viewer')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: FAIL — Vista 360 button not found (handleColorSelect not yet wired)

- [ ] **Step 3: Add handleColorSelect in Configurador.tsx**

In `src/components/sections/Configurador.tsx`, add after the `handleVersionSelect` function (around line 26):

```ts
function handleColorSelect(id: string) {
  if (imageView === '360') setImageView('exterior')
  setSelectedColorId(id)
}
```

Then update the `OptionsPanel` prop on line 103, changing:

```tsx
onSelectColor={setSelectedColorId}
```

to:

```tsx
onSelectColor={handleColorSelect}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: All PASS

- [ ] **Step 5: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Configurador.tsx tests/Configurador.test.tsx
git commit -m "feat: auto-close 360 view when color swatch is clicked"
```

---

### Task 4: Smoke test

- [ ] **Step 1: Start dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000` and check:

1. The standalone 360 view section is no longer visible while scrolling
2. In the Configurador, the left image panel shows a "Vista 360" pill to the left of the "Exterior | Interior" toggle
3. Clicking "Vista 360" fills the left panel with the draggable 360° viewer
4. The `← Drag to explore →` hint appears and fades after ~2 seconds
5. Dragging rotates the car
6. The "Close" button dismisses the 360 view and returns to the exterior color image
7. While in 360 view, clicking any color swatch closes the 360 view and shows the correct color image
8. Switching to Interior and back still works normally

- [ ] **Step 2: Final test run**

```bash
npx jest --no-coverage
```

Expected: All tests pass
