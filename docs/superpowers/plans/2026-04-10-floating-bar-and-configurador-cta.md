# Floating Bar & Configurador CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add desktop gap + red colour to the BottomCTABar CTA, and replace the Configurador's direct-open CTA with a dropdown matching the BottomCTABar pattern.

**Architecture:** Two independent edits — pure CSS tweaks to `BottomCTABar.tsx`, and new dropdown state/UI in `Configurador.tsx`. No shared component extracted. TDD: Configurador tests are updated first (with failing tests committed), then the implementation makes them pass.

**Tech Stack:** React 18, Next.js (App Router), Tailwind CSS, Lucide React icons, Jest + React Testing Library

---

## Files

| File | Change |
|---|---|
| `src/components/ui/BottomCTABar.tsx` | Add `md:gap-16` to main row; change button to red |
| `src/components/sections/Configurador.tsx` | Add dropdown state/refs/effects/actions; update bottom bar UI |
| `tests/Configurador.test.tsx` | Update 4 existing tests; add 6 new dropdown behaviour tests |

---

## Task 1: BottomCTABar — gap + colour

**Files:**
- Modify: `src/components/ui/BottomCTABar.tsx`

- [ ] **Step 1: Apply the two CSS changes**

In `src/components/ui/BottomCTABar.tsx`, make two targeted edits:

**Edit 1** — main row div (line ~144): add `md:gap-16`

```tsx
// Before
<div
  data-testid="main-row"
  className="flex items-center justify-between pl-7 pr-2.5 py-2.5"
>

// After
<div
  data-testid="main-row"
  className="flex items-center justify-between md:gap-16 pl-7 pr-2.5 py-2.5"
>
```

**Edit 2** — the "Tenho Interesse" toggle button (line ~156): change colours from white to red

```tsx
// Before
className="bg-white text-[#0A0A0A] font-semibold text-base px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto"

// After
className="bg-[#E8372F] text-white font-semibold text-base px-6 py-2.5 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto"
```

- [ ] **Step 2: Run BottomCTABar tests to verify nothing broke**

```bash
npx jest tests/components/ui/BottomCTABar.test.tsx --no-coverage
```

Expected: all tests pass (CSS-only changes have no test impact).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BottomCTABar.tsx
git commit -m "feat(BottomCTABar): add md:gap-16 and red CTA colour"
```

---

## Task 2: Configurador — update + add tests (TDD first)

**Files:**
- Modify: `tests/Configurador.test.tsx`

- [ ] **Step 1: Update the 4 tests that assume direct drawer opening**

In `tests/Configurador.test.tsx`, replace the four tests below exactly as shown.

**Test 1** — was `clicking Tenho Interesse opens the reservation drawer` (line ~104):

```tsx
it('clicking "Tenho Interesse" opens the dropdown, not the drawer directly', () => {
  render(<Configurador />)
  expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
  fireEvent.click(buttons[0])
  expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /quero reservar/i })).toBeInTheDocument()
})
```

**Test 2** — `closing the drawer hides it` (line ~112): add dropdown click before drawer interaction:

```tsx
it('closing the drawer hides it', () => {
  render(<Configurador />)
  const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
  fireEvent.click(buttons[0])
  fireEvent.click(screen.getByRole('button', { name: /quero reservar/i }))
  expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Fechar'))
  expect(screen.queryByTestId('reservation-drawer')).not.toBeInTheDocument()
})
```

**Test 3** — `dispatches reservationdrawer:open when the reserve button is clicked` (line ~146): rename and add dropdown click step:

```tsx
it('dispatches reservationdrawer:open when "Quero reservar" is clicked in dropdown', async () => {
  render(<Configurador />)
  await act(async () => {
    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /quero reservar/i }))
  })
  expect(receivedEvents).toContain('reservationdrawer:open')
})
```

**Test 4** — `dispatches reservationdrawer:close when the drawer is closed` (line ~154): add dropdown click step:

```tsx
it('dispatches reservationdrawer:close when the drawer is closed', async () => {
  render(<Configurador />)
  await act(async () => {
    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /quero reservar/i }))
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
  })
  expect(receivedEvents).toContain('reservationdrawer:close')
})
```

- [ ] **Step 2: Add 6 new dropdown behaviour tests**

Append a new `describe` block at the end of `tests/Configurador.test.tsx`:

```tsx
describe('Configurador — Tenho Interesse dropdown', () => {
  it('"Tenho Interesse" buttons have aria-expanded=false by default', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    buttons.forEach(btn => expect(btn).toHaveAttribute('aria-expanded', 'false'))
  })

  it('clicking "Tenho Interesse" sets aria-expanded=true and shows dropdown options', () => {
    render(<Configurador />)
    const buttons = screen.getAllByRole('button', { name: /tenho interesse/i })
    fireEvent.click(buttons[0])
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /quero ser contactado/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quero reservar/i })).toBeInTheDocument()
  })

  it('clicking "Quero reservar" opens the reservation drawer and closes the dropdown', () => {
    render(<Configurador />)
    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /quero reservar/i }))
    expect(screen.getByTestId('reservation-drawer')).toBeInTheDocument()
    const toggleBtns = screen.getAllByRole('button', { name: /tenho interesse/i })
    toggleBtns.forEach(btn => expect(btn).toHaveAttribute('aria-expanded', 'false'))
  })

  it('clicking "Quero ser contactado" scrolls to #contacto and closes the dropdown', () => {
    render(<Configurador />)
    const mockScrollIntoView = jest.fn()
    const mockGetElementById = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue({ scrollIntoView: mockScrollIntoView } as unknown as HTMLElement)

    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /quero ser contactado/i }))

    expect(mockGetElementById).toHaveBeenCalledWith('contacto')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    const toggleBtns = screen.getAllByRole('button', { name: /tenho interesse/i })
    toggleBtns.forEach(btn => expect(btn).toHaveAttribute('aria-expanded', 'false'))
    mockGetElementById.mockRestore()
  })

  it('pressing Escape closes the dropdown', () => {
    render(<Configurador />)
    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    expect(screen.getByRole('button', { name: /quero reservar/i })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    const toggleBtns = screen.getAllByRole('button', { name: /tenho interesse/i })
    toggleBtns.forEach(btn => expect(btn).toHaveAttribute('aria-expanded', 'false'))
  })

  it('clicking outside the dropdown closes it', () => {
    render(<Configurador />)
    fireEvent.click(screen.getAllByRole('button', { name: /tenho interesse/i })[0])
    expect(screen.getByRole('button', { name: /quero reservar/i })).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    const toggleBtns = screen.getAllByRole('button', { name: /tenho interesse/i })
    toggleBtns.forEach(btn => expect(btn).toHaveAttribute('aria-expanded', 'false'))
  })
})
```

- [ ] **Step 3: Run Configurador tests — verify they fail as expected**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: the 4 updated tests and all 6 new tests **fail**. The unmodified tests still pass. This confirms the tests describe behaviour not yet implemented.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/Configurador.test.tsx
git commit -m "test(Configurador): update and add tests for Tenho Interesse dropdown"
```

---

## Task 3: Configurador — implement the dropdown

**Files:**
- Modify: `src/components/sections/Configurador.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/components/sections/Configurador.tsx`, update the React import line to include `useRef` (already present) and add the Lucide icons:

```tsx
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
```

(The existing `useState`, `useEffect`, `useRef` are already imported — only `ChevronDown` and `ArrowRight` are new.)

- [ ] **Step 2: Add dropdown state**

Inside `Configurador()`, after the existing `const [isDrawerOpen, setIsDrawerOpen] = useState(false)` line, add:

```tsx
const [isDropdownOpen, setIsDropdownOpen] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)
```

- [ ] **Step 3: Add close-on-outside-click effect**

Add this `useEffect` after the `ctabar:reserve` listener effect (after line ~98):

```tsx
useEffect(() => {
  if (!isDropdownOpen) return
  const onMouseDown = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsDropdownOpen(false)
    }
  }
  document.addEventListener('mousedown', onMouseDown)
  return () => document.removeEventListener('mousedown', onMouseDown)
}, [isDropdownOpen])
```

- [ ] **Step 4: Add close-on-Escape effect**

Add directly after the mousedown effect:

```tsx
useEffect(() => {
  if (!isDropdownOpen) return
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsDropdownOpen(false)
  }
  document.addEventListener('keydown', onKeyDown)
  return () => document.removeEventListener('keydown', onKeyDown)
}, [isDropdownOpen])
```

- [ ] **Step 5: Add action functions**

Add these two functions after `handleReserve`:

```tsx
function scrollToContacto() {
  document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  setIsDropdownOpen(false)
}

function openReservationFromDropdown() {
  setIsDrawerOpen(true)
  setIsDropdownOpen(false)
}
```

- [ ] **Step 6: Replace the bottom bar JSX**

Replace the entire `<div className="border-t border-gray-100 bg-white px-8 py-5">` block (lines ~131–161) with:

```tsx
<div ref={dropdownRef} className="border-t border-gray-100 bg-white px-8 py-5 relative">

  {/* ── Dropdown panel ── */}
  {isDropdownOpen && (
    <div
      id="configurador-interesse-menu"
      className="absolute bottom-full left-0 right-0 bg-[#0A0A0A] rounded-t-xl overflow-hidden"
    >
      <div className="flex flex-col py-1">
        <button
          type="button"
          onClick={scrollToContacto}
          className="w-full text-white font-semibold text-base px-5 py-3 flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
        >
          <span>Quero ser contactado</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={openReservationFromDropdown}
          className="w-full text-white font-semibold text-base px-5 py-3 flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
        >
          <span>Quero reservar</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )}

  {/* ── Desktop ── */}
  <div className="hidden md:flex items-center justify-between">
    <div className="flex flex-col">
      <span className="text-sm text-[#86868b]">Nissan Leaf {activeTrim.name}</span>
      <span className="text-xl font-semibold text-[#0A0A0A]">
        €{effectivePrice.toLocaleString('pt-PT')}
      </span>
    </div>
    <button
      type="button"
      onClick={() => setIsDropdownOpen(prev => !prev)}
      aria-expanded={isDropdownOpen}
      aria-controls="configurador-interesse-menu"
      className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer flex items-center gap-2"
    >
      Tenho Interesse
      <ChevronDown
        size={16}
        className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
        aria-hidden="true"
      />
    </button>
  </div>

  {/* ── Mobile ── */}
  <div className="flex md:hidden flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-base font-semibold text-[#0A0A0A]">{activeTrim.name}</span>
      <span className="text-base text-[#86868b]">€{effectivePrice.toLocaleString('pt-PT')}</span>
    </div>
    <button
      type="button"
      onClick={() => setIsDropdownOpen(prev => !prev)}
      aria-expanded={isDropdownOpen}
      aria-controls="configurador-interesse-menu"
      className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer flex items-center justify-center gap-2"
    >
      Tenho Interesse
      <ChevronDown
        size={16}
        className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
        aria-hidden="true"
      />
    </button>
  </div>

</div>
```

- [ ] **Step 7: Run all Configurador tests**

```bash
npx jest tests/Configurador.test.tsx --no-coverage
```

Expected: all tests pass.

- [ ] **Step 8: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/Configurador.tsx
git commit -m "feat(Configurador): replace direct CTA with Tenho Interesse dropdown"
```
