# Tenho Interesse Button Redesign

**Date:** 2026-04-10  
**Scope:** `BottomCTABar` floating bar + `Configurador` configurator CTA

---

## Summary

Rename all CTA buttons from "Reservar agora" to "Tenho Interesse" and redesign the floating `BottomCTABar` to use a single merged pill button with an upward-opening dropdown submenu.

---

## 1. Configurador CTA

**Change:** Copy only.

- Desktop button (`Configurador.tsx` line 141): `Reservar agora` → `Tenho Interesse`
- Mobile button (`Configurador.tsx` line 155): `Reservar agora` → `Tenho Interesse`
- Both `aria-label` attributes updated accordingly
- No structural, styling, or behavioural changes

---

## 2. BottomCTABar — Floating Bar

### 2.1 Icon library

Add `lucide-react` as a dependency.

- `ChevronDown` — toggle arrow inside the "Tenho Interesse" pill button
- `ArrowRight` — arrow inside each submenu item

### 2.2 Layout restructure

Current: two buttons side by side (red CTA pill + separate expand chevron button).  
New: one single pill button `Tenho Interesse [ChevronDown]` that toggles the menu.

DOM order (top → bottom inside the outer container):

```
outer container
├── MENU PANEL        ← new, appears above main row
└── MAIN ROW          ← always visible (replaces collapsed row)
```

The outer container transitions between `rounded-full` (collapsed) and `rounded-2xl` (expanded), same as current.

### 2.3 Menu panel

- Appears **above** the main row (DOM order first, flex-col)
- Animates in/out via `grid-template-rows: 0fr ↔ 1fr` (same technique as current expanded panel)
- Contains two items only:
  1. "Quero ser contactado" — calls `scrollToContacto()` + closes menu
  2. "Quero reservar" — calls `openReservation()` + closes menu
- Each item: full-width button, text left-aligned, `ArrowRight` icon on the right
- `ArrowRight` translates `translate-x-0 → translate-x-1` on hover, `transition-transform duration-200`
- Visual gap between menu panel and main row: achieved via `pb-3` padding at the bottom of the menu panel inner content + no top padding on main row

### 2.4 Main row

- Always visible (no collapse animation)
- Desktop: `[Nissan Leaf · Desde 39.900€]` on the left, `[Tenho Interesse ↓]` on the right
- Mobile: `[Tenho Interesse ↓]` right-aligned (no price info, same as current)
- Button styling: `bg-white text-[#0A0A0A]` pill — white on dark bar background
- `ChevronDown` icon inline, `rotate-0` when closed, `rotate-180` when open
- Rotation: `transition-transform duration-300`

### 2.5 Behaviour (unchanged from current)

- Bar hidden when: not past header, configurador visible, closing section visible, or reservation drawer open
- Collapses on outside click (mousedown), Escape key
- `isExpanded` resets to `false` when bar is hidden
- `openReservation()` dispatches `ctabar:reserve` custom event
- `scrollToContacto()` smooth-scrolls to `#contacto`

---

## 3. Accessibility

- "Tenho Interesse" button: `aria-expanded={isExpanded}`, `aria-label="Tenho Interesse"`
- Menu items: `tabIndex={isExpanded ? undefined : -1}` (same pattern as current)
- `aria-hidden` on outer container when bar is hidden

---

## 4. Out of scope

- No changes to `ReservationDrawer`, `ContactDrawer`, or any other component
- No changes to the `StickyBar` (configurator sticky bar at top)
- No changes to `CTASection`
