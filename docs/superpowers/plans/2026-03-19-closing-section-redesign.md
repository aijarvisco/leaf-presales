# Closing Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `ClosingSection.tsx` to feel cinematic — vertically centered headline, warm golden-hour gradient, cleaner coral CTA cards.

**Architecture:** Pure styling change on a single component. No new files, no new dependencies, no logic changes. All motion animations are preserved; only classes and a few prop values change.

**Tech Stack:** Next.js, Tailwind CSS, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-19-closing-section-redesign.md`

---

### Task 1: Section layout — remove flex column, delete spacer

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:35` (`<section>` opening tag)
- Modify: `src/components/sections/ClosingSection.tsx:65` (spacer `<div>`)

- [ ] **Step 1: Update `<section>` classes**

  In `ClosingSection.tsx`, find:
  ```tsx
  <section className="relative h-screen flex flex-col overflow-hidden">
  ```
  Replace with:
  ```tsx
  <section className="relative h-screen overflow-hidden">
  ```

- [ ] **Step 2: Delete the spacer div**

  Find and delete this line entirely:
  ```tsx
  {/* Spacer — lets the car image breathe */}
  <div className="flex-1" />
  ```

- [ ] **Step 3: Verify dev server renders without layout errors**

  Run: `npm run dev`
  Open `http://localhost:3000`, scroll to the closing section.
  Expected: section still renders, no console errors (headline and CTA may overlap temporarily — that's fine, next tasks fix positioning).

---

### Task 2: Headline — absolute center positioning + animation tweak

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:50-62` (headline `motion.div`)

- [ ] **Step 1: Update headline wrapper classes and initial animation**

  Find:
  ```tsx
  <motion.div
    className="relative z-10 pt-20 px-6 max-w-5xl mx-auto w-full"
    initial={{ opacity: 0, y: -20 }}
  ```
  Replace with:
  ```tsx
  <motion.div
    className="absolute z-10 left-6 right-6 top-1/2 -translate-y-[60%] text-center"
    initial={{ opacity: 0, y: -10 }}
  ```
  (All other props — `whileInView`, `viewport`, `transition` — are unchanged.)

- [ ] **Step 2: Verify in browser**

  Headline should now appear vertically centered on the car image, centered horizontally.

---

### Task 3: CTA bar — absolute bottom positioning

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:68-73` (CTA bar `motion.div`)

- [ ] **Step 1: Update CTA wrapper classes**

  Find:
  ```tsx
  className="relative z-10 max-w-5xl mx-auto w-full px-6 pb-12"
  ```
  Replace with:
  ```tsx
  className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pb-12"
  ```
  (All animation props unchanged.)

- [ ] **Step 2: Verify in browser**

  CTA cards should now be pinned to the bottom of the viewport.

---

### Task 4: Gradient — warm golden-hour

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:46` (gradient overlay div)

- [ ] **Step 1: Replace gradient classes**

  Find:
  ```tsx
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent via-50% to-black/80" />
  ```
  Replace with:
  ```tsx
  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
  ```

- [ ] **Step 2: Verify in browser**

  Background should have a warm, golden-hour amber tint in the mid-section rather than a neutral dark.

---

### Task 5: Left CTA card — charcoal bg, no border, filled arrow, body text size

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:77-97` (left button)

- [ ] **Step 1: Update left card classes**

  Find the left `<button>` opening tag:
  ```tsx
  className="group flex flex-col justify-between gap-5 w-full sm:w-[36%] px-6 py-5 bg-black/65 backdrop-blur-sm text-left cursor-pointer transition-colors duration-200 hover:bg-black/75 border-r border-white/10"
  ```
  Replace with:
  ```tsx
  className="group flex flex-col justify-between gap-5 w-full sm:w-[36%] px-6 py-5 bg-neutral-900/80 backdrop-blur-sm text-left cursor-pointer transition-colors duration-200 hover:bg-neutral-900/90"
  ```

- [ ] **Step 2: Update body text size**

  Find inside the left button:
  ```tsx
  <p className="text-sm font-light text-white/80 leading-relaxed">
  ```
  Replace with:
  ```tsx
  <p className="text-base font-light text-white/80 leading-relaxed">
  ```

- [ ] **Step 3: Delete the "Sem compromisso" sub-text**

  Find and delete:
  ```tsx
  <span className="text-xs text-white/35">Sem compromisso</span>
  ```

- [ ] **Step 4: Update arrow button**

  Find the arrow button div inside the left card:
  ```tsx
  <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors duration-200">
  ```
  Replace with:
  ```tsx
  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-200">
  ```

- [ ] **Step 5: Verify in browser**

  Left card should show dark charcoal (not pure black), no right border, larger body text, filled arrow button, no "Sem compromisso" line.

---

### Task 6: Right CTA card — coral bg, filled arrow, body text size

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:99-122` (right button)

- [ ] **Step 1: Update right card classes**

  Find the right `<button>` opening tag:
  ```tsx
  className="group flex flex-col justify-between gap-5 flex-1 px-6 py-5 bg-[#C3002F] text-left cursor-pointer transition-colors duration-200 hover:bg-[#a8002a] disabled:opacity-70 disabled:cursor-not-allowed"
  ```
  Replace with:
  ```tsx
  className="group flex flex-col justify-between gap-5 flex-1 px-6 py-5 bg-[#E07055] text-left cursor-pointer transition-colors duration-200 hover:bg-[#CC6249] disabled:opacity-70 disabled:cursor-not-allowed"
  ```

- [ ] **Step 2: Update body text size**

  Find inside the right button:
  ```tsx
  <p className="text-sm font-light text-white leading-relaxed">
  ```
  Replace with:
  ```tsx
  <p className="text-base font-light text-white leading-relaxed">
  ```

- [ ] **Step 3: Delete the "Pagamento seguro via Stripe" sub-text**

  Find and delete:
  ```tsx
  <span className="text-xs text-white/50">Pagamento seguro via Stripe</span>
  ```

- [ ] **Step 4: Update arrow button**

  Find the arrow button div inside the right card:
  ```tsx
  <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors duration-200">
  ```
  Replace with:
  ```tsx
  <div className="w-8 h-8 rounded-full bg-neutral-900/25 flex items-center justify-center hover:bg-neutral-900/40 transition-colors duration-200">
  ```

- [ ] **Step 5: Verify in browser**

  Right card should show warm coral (not Nissan red), larger body text, filled arrow button, no "Pagamento seguro via Stripe" line.

---

### Task 7: Final review and commit

- [ ] **Step 1: Full visual check**

  Open `http://localhost:3000`, scroll to the closing section and verify:
  - Headline sits vertically centered on the car (~45% from top)
  - Gradient has a warm amber cast in the mid-section
  - Left card: dark charcoal, no right border, `text-base` body, filled circle arrow
  - Right card: coral `#E07055`, `text-base` body, filled dark circle arrow
  - No sub-text lines in either card
  - Hover states work on both cards and arrows
  - Scroll-triggered animations still fire correctly

- [ ] **Step 2: Check for TypeScript/lint errors**

  Run: `npm run build`
  Expected: build completes with no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/sections/ClosingSection.tsx
  git commit -m "feat: redesign ClosingSection with cinematic layout and warm coral CTAs"
  ```
