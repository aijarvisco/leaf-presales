# Mobile Layout Fixes — Design Spec

**Date:** 2026-04-09  
**Scope:** Mobile-only CSS/layout corrections across 5 components + 1 global overflow rule.

---

## Fix 1 — ValuesSection paragraph font size

**File:** `src/components/sections/ValuesSection.tsx:178–183`

The paragraph below the section title uses `text-xl` with no mobile breakpoint. On mobile this is too large compared to the roof section.

**Change:** `text-xl` → `text-base md:text-xl` on both the `paragraphHtml` render path and the fallback `<p>`.

**Reference:** Roof section uses `text-base sm:text-xl` — use `text-base md:text-xl` for consistency with the existing `md:` breakpoints in ValuesSection.

---

## Fix 2 — Autonomia stats responsive sizing

**File:** `src/components/sections/AutonomiaSectionV2.tsx:99–128`

Stats panel has two mobile problems:
1. `px-16` side padding is too wide for a phone, causing overflow/cramping.
2. Inline `fontSize: '56px'` (number + unit) and `fontSize: '21px'` (qualifier/descriptor) are hardcoded and don't scale down.

**Changes:**
- Container padding: `px-16` → `px-4 md:px-16`
- Number/unit font size: replace `fontSize: '56px'` with Tailwind `className` using `text-4xl md:text-5xl` (≈36px / 48px). Keep `fontWeight: 500`, `letterSpacing: '-0.02em'`.
- Qualifier/descriptor font size: replace `fontSize: '21px'` with `text-sm md:text-xl`.

---

## Fix 3 — SavingsCalculator mobile layout

**File:** `src/components/forms/SavingsCalculator.tsx`

Current layout: `flex-col md:flex-row` — inputs (left) then savings summary (right). On mobile this puts inputs before the savings result, which is backwards.

**Changes:**
- Reverse DOM order: move the right column (savings summary) before the left column (inputs).
- Use `order-2 md:order-1` on inputs column, `order-1 md:order-2` on savings column to restore desktop order.
- Add `hidden md:block` on the car image `<div>` to hide it on mobile.

---

## Fix 4 — ClosingSection CTA paragraph sizing

**File:** `src/components/sections/ClosingSection.tsx:69,89`

Both CTA card paragraphs ("Tem dúvidas?..." and "300€ totalmente...") use `text-xl` with no mobile breakpoint.

**Change:** `text-xl` → `text-base sm:text-xl` on both `<p>` elements, matching the roof section's responsive pattern.

---

## Fix 5 — BottomCTABar viewport overflow

**File:** `src/components/ui/BottomCTABar.tsx:102`

The outer `fixed` div has no width constraint. On mobile the pill can exceed the viewport width.

**Change:** Add `max-w-[calc(100vw-2rem)]` to the outer div so it never exceeds the available screen width, regardless of content.

---

## Fix 6 — Global horizontal overflow containment

**File:** `src/app/page.tsx`

On mobile, no element inside `<main>` should exceed the container width, except the `ValuesSection` carousel tracks (which intentionally peek cards out of bounds).

**Change:** Add `overflow-x-hidden` to the `<main>` element.

**Exception:** `ValuesSection` has its own `overflow-hidden` on the carousel wrapper div, so the track cards will still scroll horizontally within that boundary. The `overflow-x-hidden` on `<main>` clips the section boundary cleanly without breaking carousel interaction.

**Verification:** After applying, confirm the carousel still scrolls and cards are visible to the side on both ValuesSection instances.
