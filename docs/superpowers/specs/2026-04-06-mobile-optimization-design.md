# Mobile Optimisation Design

**Date:** 2026-04-06
**Scope:** Responsive overhaul across 4 viewport tiers — mobile, tablet, small desktop, large desktop.
**Constraint:** Desktop layout and behaviour must not break. All changes are additive (mobile-first).

---

## 1. Breakpoint Strategy

Standard Tailwind tiers used consistently throughout:

| Tier | Prefix | Range |
|------|--------|-------|
| Mobile | *(default)* | < 640px |
| Tablet | `sm:` / `md:` | 640–1024px |
| Small desktop | `lg:` | 1024–1280px |
| Large desktop | `xl:` | 1280px+ |

No custom breakpoints. All desktop-specific rules move to `xl:` so current visual behaviour is preserved on large screens.

---

## 2. Typography System

### 2.1 CSS Custom Properties (globals.css)

Add two fluid clamp variables:

```css
:root {
  --text-display: clamp(2rem, 7vw, 5rem);   /* 32px → 80px */
  --text-h2: clamp(1.75rem, 5vw, 3.5rem);   /* 28px → 56px */
}
```

### 2.2 Application

| Section | Element | Before | After |
|---------|---------|--------|-------|
| DesignIntroSection | `<h2>` | `fontSize: '80px'` inline style | `style={{ fontSize: 'var(--text-display)' }}` |
| AutonomiaSectionV2 | `<h2>` | `fontSize: '80px'` inline style | `style={{ fontSize: 'var(--text-display)' }}` |
| Highlights | `<h2>` | `text-[56px]` | `style={{ fontSize: 'var(--text-h2)' }}` |
| LeadSection | `<h2>` | `text-[56px]` | `style={{ fontSize: 'var(--text-h2)' }}` |
| CTASection | `<h2>` | `text-[56px]` | `style={{ fontSize: 'var(--text-h2)' }}` |
| ClosingSection | `<h2>` | `text-[56px]` | `style={{ fontSize: 'var(--text-h2)' }}` |
| ValuesSection | `<h2>` | `fontSize: '56px'` inline style | `style={{ fontSize: 'var(--text-h2)' }}` |
| RangeSavings | `<h2>` | `text-4xl md:text-5xl` | `style={{ fontSize: 'var(--text-h2)' }}` |

### 2.3 Eyebrow / Section Labels

Standardise all section eyebrow labels (currently `text-xl` in ValuesSection, `text-3xl` in DesignIntroSection and AutonomiaSectionV2) to: `text-base md:text-xl`.

### 2.4 Hero Headline

Extend existing responsive steps to cover mobile: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`.

### 2.5 Stat Numbers (AutonomiaSectionV2)

The `56px` inline stat numbers are data display, not headings. Leave as-is.

---

## 3. Section Spacing & Padding

### 3.1 Vertical Section Padding

Replace `pt-48 pb-48` across all sections:

```
pt-16 pb-16 md:pt-24 md:pb-24 xl:pt-48 xl:pb-48
```

### 3.2 Section Title Margin-Bottom

Replace `mb-20` on title blocks:

```
mb-10 md:mb-14 xl:mb-20
```

### 3.3 SiteHeader Padding

Replace hardcoded `paddingLeft: '64px', paddingRight: '64px'` inline styles with Tailwind classes on the `<header>` element:

```
px-6 md:px-10 lg:px-16
```

Remove the `style` prop from the header entirely (height and background can remain or be moved to className).

---

## 4. DesignIntroSection Sizing

**File:** `src/components/sections/DesignIntroSection.tsx`

| Issue | Before | After |
|-------|--------|-------|
| Heading font size | `style={{ fontSize: '80px' }}` | `style={{ fontSize: 'var(--text-display)' }}` |
| Car image min-width | `min-w-[900px]` | Remove — `w-screen` is sufficient |
| Section height | `height: '300vh'` | No change — controls scroll budget, not visual size |
| Animation logic | Unchanged | Unchanged |

---

## 5. HighlightCard Mobile Layout

**Files:** `src/components/ui/HighlightCard.tsx`

On `md+` (tablet and above): existing text overlay on image is preserved exactly.

On mobile (`< md`): text moves below the image in a plain dark `<p>`, gradient overlay hidden.

### Implementation

Single component, two rendering paths via responsive Tailwind classes:

```tsx
<div className="w-full flex flex-col">
  {/* Image — same aspect ratio at all sizes */}
  <div className="w-full aspect-[8/5] rounded-2xl overflow-hidden relative select-none">
    <Image ... />
    {/* Gradient — desktop only */}
    <div className={`absolute inset-0 hidden md:block ${overlayClasses[textPosition]}`} />
    {/* Text overlay — desktop only */}
    <div className={`hidden md:block ${positionClasses[textPosition]} ...`}>
      <p ...>{description}</p>
    </div>
  </div>
  {/* Text below — mobile only */}
  <div className="block md:hidden mt-3 px-1">
    <p className="text-base font-medium text-[#0A0A0A] leading-snug tracking-[-0.02em]">
      {description}
    </p>
  </div>
</div>
```

No new component. No changes to desktop rendering.

---

## 6. Carousel Card Widths & Peek Behaviour

### 6.1 Highlights

**File:** `src/components/sections/Highlights.tsx`

Current divisor `1.5` gives ~50% next-card peek at all sizes. Adjust to ~20% on mobile:

```ts
const divisor = viewportWidth >= 768 ? 1.5 : 1.25
const cardWidth = Math.round((viewportWidth - containerLeft - GAP) / divisor)
```

No changes to animation, drag, or wheel logic.

### 6.2 ValuesSection

**File:** `src/components/sections/ValuesSection.tsx`

Replace static constants:

```ts
// Before
const CARD_HEIGHT = 480
const CARD_WIDTH  = 853  // fixed, breaks mobile

// After — computed from viewport in component state
const cardWidth = viewportWidth >= 768
  ? Math.min(Math.round((viewportWidth - containerLeft - GAP) / 1.5), 853)
  : Math.round((viewportWidth - containerLeft - GAP) / 1.25)
const cardHeight = Math.round(cardWidth * 9 / 16)
```

`Math.min(..., 853)` caps desktop width at the current value — large-screen layout unchanged.

`ValuesCard` receives `width={cardWidth} height={cardHeight}` (same props, just dynamic values).

`getOffset` and all animation/drag logic remain identical — they already use the variable name `CARD_WIDTH`; replace with `cardWidth`.

---

## 7. Remaining Component Fixes

### 7.1 BottomCTABar

**File:** `src/components/ui/BottomCTABar.tsx`

| Issue | Fix |
|-------|-----|
| `gap-24` too wide on small phones | `gap-4 md:gap-24` |
| `bottom-8` hides behind home indicator on notched devices | Add `pb-[env(safe-area-inset-bottom)]` to container |

### 7.2 ContactForm Grid

**File:** `src/components/forms/ContactForm.tsx`

```
// Before
grid grid-cols-2 gap-4

// After
grid grid-cols-1 md:grid-cols-2 gap-4
```

### 7.3 Drawers (ReservationDrawer + ContactDrawer)

**Files:** `src/components/ui/ReservationDrawer.tsx`, `src/components/ui/ContactDrawer.tsx`

Add `pb-[env(safe-area-inset-bottom)]` to the inner scrollable container so content is not obscured by the home indicator on iPhone X+ and equivalent Android devices. No layout or width changes.

---

## Files Touched

| File | Change type |
|------|------------|
| `src/app/globals.css` | Add `--text-display`, `--text-h2` CSS vars |
| `src/components/layout/SiteHeader.tsx` | Responsive padding |
| `src/components/sections/Hero.tsx` | Extended responsive headline steps |
| `src/components/sections/DesignIntroSection.tsx` | Font var, remove min-w, eyebrow label size |
| `src/components/sections/AutonomiaSectionV2.tsx` | Font vars, eyebrow label size, section spacing |
| `src/components/sections/Highlights.tsx` | Section spacing, title font var, peek divisor |
| `src/components/sections/ValuesSection.tsx` | Section spacing, title font var, dynamic card size |
| `src/components/sections/LeadSection.tsx` | Section spacing, title font var |
| `src/components/sections/CTASection.tsx` | Section spacing, title font var |
| `src/components/sections/ClosingSection.tsx` | Section spacing, title font var |
| `src/components/sections/RangeSavings.tsx` | Title font var |
| `src/components/ui/HighlightCard.tsx` | Mobile text-below layout |
| `src/components/ui/ValuesCard.tsx` | No changes (props unchanged) |
| `src/components/ui/BottomCTABar.tsx` | Gap + safe-area padding |
| `src/components/forms/ContactForm.tsx` | Responsive grid |
| `src/components/ui/ReservationDrawer.tsx` | Safe-area padding |
| `src/components/ui/ContactDrawer.tsx` | Safe-area padding |
