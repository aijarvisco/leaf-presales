# Responsive Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make headings visibly smaller on MacBook Air 13" (xl / 1280px CSS viewport) while keeping 27" monitor (2xl / 1536px+) sizes unchanged.

**Architecture:** Two targeted edits — Tailwind breakpoint classes on Hero h1/label, and `vw` multiplier reduction in the two CSS custom properties. No new files, no structural changes.

**Tech Stack:** Next.js, Tailwind CSS v4, CSS custom properties with `clamp()`

---

### Task 1: Update Hero h1 and label breakpoints

**Files:**
- Modify: `src/components/sections/Hero.tsx:98` (h1 className), `src/components/sections/Hero.tsx:89` (label className)

- [ ] **Step 1: Open the file and locate the two class strings**

  In `src/components/sections/Hero.tsx`:

  - Line ~89 — label `<motion.p>`:
    ```
    className="text-2xl sm:text-3xl text-white font-medium uppercase mb-3 tracking-[-0.07em] leading-none"
    ```
  - Line ~98 — h1 `<motion.h1>`:
    ```
    className="font-medium text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl text-white leading-none tracking-[-0.05em]"
    ```

- [ ] **Step 2: Update h1 class string**

  Change `xl:text-8xl` → `xl:text-7xl 2xl:text-8xl`:

  ```tsx
  className="font-medium text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-7xl 2xl:text-8xl text-white leading-none tracking-[-0.05em]"
  ```

  Result:
  - MacBook (xl / 1280px): 72px instead of 96px
  - 27" monitor (2xl / 1536px+): 96px — unchanged

- [ ] **Step 3: Update label class string**

  Add `2xl:text-4xl` to keep label-to-headline proportion on large screens:

  ```tsx
  className="text-2xl sm:text-3xl 2xl:text-4xl text-white font-medium uppercase mb-3 tracking-[-0.07em] leading-none"
  ```

  Result:
  - MacBook (xl / 1280px): 1.875rem — unchanged
  - 27" monitor (2xl / 1536px+): 2.25rem — slightly larger to match h1 growth

- [ ] **Step 4: Verify the build passes**

  ```bash
  npm run build
  ```

  Expected: no TypeScript or compilation errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/sections/Hero.tsx
  git commit -m "fix: decrease hero heading size at MacBook (xl) breakpoint"
  ```

---

### Task 2: Lower clamp() multipliers for CSS typography variables

**Files:**
- Modify: `src/app/globals.css:23-24`

- [ ] **Step 1: Open the file and locate the custom properties**

  In `src/app/globals.css`, inside `@layer base :root`:

  ```css
  --text-display: clamp(2rem, 7vw, 5rem);
  --text-h2: clamp(1.75rem, 5vw, 3.5rem);
  ```

  Both max values are hit at ~1120–1143px — identical output on all wide screens.

- [ ] **Step 2: Update both custom properties**

  ```css
  --text-display: clamp(2rem, 4.5vw, 5rem);
  --text-h2: clamp(1.75rem, 3.5vw, 3.5rem);
  ```

  Results for `--text-display`:
  - MacBook (~1280px): `4.5vw × 1280 = 57.6px` (3.6rem) — was 80px
  - 27" monitor (~1920px): `4.5vw × 1920 = 86.4px` → clamped to 80px — unchanged

  Results for `--text-h2`:
  - MacBook (~1280px): `3.5vw × 1280 = 44.8px` (2.8rem) — was 56px
  - 27" monitor (~1920px): `3.5vw × 1920 = 67.2px` → clamped to 56px — unchanged

- [ ] **Step 3: Verify the build passes**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 4: Visual check — open the dev server and compare sections**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000` and check:
  - DesignIntroSection heading (uses `--text-display`): should be smaller at 1280px viewport width
  - Highlights section heading (uses `--text-h2`): smaller at 1280px
  - ClosingSection heading (uses `--text-h2`): smaller at 1280px

  Simulate MacBook by resizing browser to 1280px wide, then 1920px wide to confirm the difference.

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/globals.css
  git commit -m "fix: reduce clamp() vw multipliers so section headings scale down at MacBook viewport"
  ```
