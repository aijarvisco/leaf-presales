# DesignIntroSection — Design Spec

**Date:** 2026-03-25
**Status:** Approved

---

## Overview

A full-viewport-height section placed between `Highlights` and `AutonomiaSectionV2` in `page.tsx`. It serves as a chapter-divider that introduces the design-focused portion of the page. A label and title appear first, then the top-view car image slides in from the right and comes to rest fully centered, covering the text.

---

## Placement

Insert one line in `page.tsx` between the existing `<Highlights />` and `<AutonomiaSectionV2 />` lines. No other sections are reordered:

```tsx
<Highlights />
<DesignIntroSection />   {/* ← new */}
<AutonomiaSectionV2 />
<ValuesSection />
<Configurator />
<Configurador onSelectVersion={setSelectedVersion} />
<CTASection selectedVersion={selectedVersion} />
<LeadSection />
<ClosingSection />
```

---

## Component

**File:** `src/components/sections/DesignIntroSection.tsx`
**Directive:** `'use client'`
**Dependencies:** `framer-motion` (already installed), `next/image`

---

## Layout

- Section: `id="design-intro"`, `min-h-screen`, `bg-[#D5D9DF]`, `overflow-hidden`, `relative`
- Text block: `absolute inset-0 flex flex-col items-center justify-center text-center` (renders first in DOM, below car)
- Car wrapper: `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` — renders after text in DOM, so it visually covers the text with no z-index needed

**Layer order (DOM, bottom → top):**
1. Text block
2. Car image wrapper (covers text by DOM order)

---

## Text Content

| Element | Value |
|---------|-------|
| Label   | `Design` |
| Title   | `Uma forma que fala por si.` |

**Label style:** `font-semibold text-sm tracking-widest uppercase text-[#0A0A0A]/60 mb-4`
**Title style:** `text-[56px] font-medium tracking-[-0.07em] leading-tight text-[#0A0A0A]` — matches existing section headings

---

## Animation

All three animated elements (`motion.div` for label, title, and car wrapper) use `whileInView` with `viewport={{ once: true, amount: 0.4 }}`. The `amount: 0.4` threshold ensures the section is well into view before anything triggers, so all three elements enter the viewport simultaneously and the phase sequence is predictable.

### Phase 1 — Text enters

| Element | `initial` | `whileInView` | transition |
|---------|-----------|---------------|------------|
| Label   | `opacity: 0, y: 16` | `opacity: 1, y: 0` | `duration: 0.4, ease: "easeOut"` |
| Title   | `opacity: 0, y: 16` | `opacity: 1, y: 0` | `duration: 0.4, delay: 0.1, ease: "easeOut"` |

### Phase 2 — Car slides in

| Property | Value |
|----------|-------|
| `initial` x | `"110vw"` |
| `whileInView` x | `0` |
| transition type | `spring` |
| stiffness | `60` |
| damping | `20` |
| mass | `1` |
| delay | `0.5` |
| `viewport` | `{ once: true, amount: 0.4 }` |

The `0.5s` delay ensures the text is visible for a beat before the car covers it.

---

## Car Image

- **Source:** `/images/leaf-top-view.png`
- **Alt:** `Nissan Leaf — vista de cima`
- **Format:** RGBA PNG (has a transparent channel — background is transparent, not white)
- **Actual size:** 2680 × 1200 px

**Critical — transparency handling:** Because the image has genuine transparency, the car image wrapper **must** include a `bg-white` class so the white "ground" fills in and the text is fully occluded when the car is centered:

```tsx
<motion.div
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D5D9DF]"
  ...
>
  <Image ... />
</motion.div>
```

**Next.js `<Image>` props:**
```tsx
<Image
  src="/images/leaf-top-view.png"
  alt="Nissan Leaf — vista de cima"
  width={2680}
  height={1200}
  sizes="100vw"
  priority={false}
  className="w-screen min-w-[900px] h-auto"
/>
```

No `unoptimized` prop — Next.js image optimisation is used.

**Mobile behaviour:** On narrow viewports (`<900px`), `min-w-[900px]` keeps the image wider than the viewport. The section's `overflow-hidden` clips the overflow. The car is centered and will appear cropped at both sides — this is the accepted behaviour on mobile.

---

## Accessibility

- Section has `id="design-intro"` for potential anchor linking
- Car image has descriptive `alt` text
- Text remains in the DOM (not removed), just visually covered by the car

---

## Out of scope

- No subtitle or body copy below the title
- No CTA button or link
- No scroll-linked / sticky behaviour
- No alternative mobile-only layout
