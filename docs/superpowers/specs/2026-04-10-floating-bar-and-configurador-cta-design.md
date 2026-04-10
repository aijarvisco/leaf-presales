# Floating Bar & Configurador CTA — Design Spec

**Date:** 2026-04-10

## Overview

Three changes across two components:

1. `BottomCTABar` — add desktop gap between content and CTA button
2. `BottomCTABar` — change CTA button colour to brand red
3. `Configurador` — add dropdown behaviour to the "Tenho Interesse" CTA, matching BottomCTABar's pattern

---

## Change 1 — BottomCTABar: desktop gap

**File:** `src/components/ui/BottomCTABar.tsx`

In the main row (`data-testid="main-row"`), add `md:gap-16` to the flex row. Leave `justify-between` and `ml-auto` on the button intact — on desktop the bar is auto-width so `justify-between` has no distributable space, making `gap-16` the effective gap between the text content and the button. On mobile the left content is `hidden md:flex` (not a flex item), so `gap-16` has no effect there and the button stays right-aligned via `ml-auto`.

---

## Change 2 — BottomCTABar: red CTA button

**File:** `src/components/ui/BottomCTABar.tsx`

Change the "Tenho Interesse" button colours:

- Before: `bg-white text-[#0A0A0A] hover:bg-white/90`
- After: `bg-[#E8372F] text-white hover:bg-[#D42F27]`

The red `#E8372F` (hover `#D42F27`) matches the Reservar CTA in `ClosingSection.tsx`. The `ChevronDown` icon already inherits text colour so no icon change needed.

---

## Change 3 — Configurador: dropdown CTA

**File:** `src/components/sections/Configurador.tsx`

### State & refs

Add to the component:

```ts
const [isDropdownOpen, setIsDropdownOpen] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)
```

### Close handlers

Add two `useEffect`s (mousedown outside + Escape key) that call `setIsDropdownOpen(false)` when `isDropdownOpen` is true — matching the pattern already used in `BottomCTABar`.

### Action functions

```ts
function scrollToContacto() {
  document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  setIsDropdownOpen(false)
}

function openReservationFromDropdown() {
  setIsDrawerOpen(true)
  setIsDropdownOpen(false)
}
```

`handleReserve` remains unchanged — it's still wired to the `ctabar:reserve` custom event.

### Button change (desktop + mobile)

Both the desktop and mobile "Tenho Interesse" buttons change from `onClick={handleReserve}` to `onClick={() => setIsDropdownOpen(prev => !prev)}`, with `aria-expanded={isDropdownOpen}` and a `ChevronDown` icon that rotates 180° when open.

### Dropdown panel

Wrap the bottom bar's inner container with `ref={dropdownRef}` and `relative`. The panel renders as an absolute overlay:

```
absolute bottom-full left-0 right-0
bg-[#0A0A0A] rounded-t-xl overflow-hidden
```

Two options, each styled as a full-width row with text left + `ArrowRight` right (identical to BottomCTABar's menu items):

| Label | Action |
|---|---|
| Quero ser contactado | `scrollToContacto()` |
| Quero reservar | `openReservationFromDropdown()` |

The panel is conditionally rendered (not animated — simple conditional render is sufficient since it's inside a bounded container).

### Accessibility

- Button: `aria-expanded={isDropdownOpen}`, `aria-controls="configurador-interesse-menu"`
- Panel: `id="configurador-interesse-menu"`, `aria-hidden={!isDropdownOpen}`
- Options: `tabIndex={isDropdownOpen ? undefined : -1}`

---

## Files changed

| File | Change |
|---|---|
| `src/components/ui/BottomCTABar.tsx` | Gap + colour tweaks |
| `src/components/sections/Configurador.tsx` | Dropdown state, close handlers, new panel |

## Files NOT changed

- `ClosingSection.tsx` — red colour is read from here but no changes needed
- `BottomCTABar` dropdown logic — remains as-is
