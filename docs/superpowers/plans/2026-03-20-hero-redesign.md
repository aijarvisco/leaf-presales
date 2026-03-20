# Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cluttered bottom-left copy block with a clean two-pole bottom bar — copy left, CTA right — and updated headline copy.

**Architecture:** Single component change. The outer content `motion.div` becomes a `flex justify-between items-end` row spanning the full bottom width. The copy block (label, headline, sub-label, reassurance) sits left; the single CTA button sits right. Mobile stacks them vertically. All scroll-driven motion and vignette layers are untouched.

**Tech Stack:** Next.js, Tailwind CSS v4, Framer Motion, Space Grotesk (loaded in `layout.tsx` with weights 400–700, auto-applied to `<h1>` via `globals.css`)

**Spec:** `docs/superpowers/specs/2026-03-20-hero-redesign-design.md`

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/components/sections/Hero.tsx` | Content block replacement + remove `scaleRule` helper |

---

## Task 1: Replace the content block in Hero.tsx

**Files:**
- Modify: `src/components/sections/Hero.tsx`

### Background

The current component has a single `motion.div` (`.absolute.bottom-16...left-0.pl-8...`) containing: label with middots, thin rule, two-line italic/roman `<h1>`, subline `<p>`, and two `<Button>` elements. The `scaleRule()` animation helper drives the thin rule and must be deleted.

**Font decision:** `globals.css` applies `font-family: var(--font-family-heading)` (Space Grotesk) + `font-bold tracking-tight` to all `h1` elements automatically. The plan adds `font-sans font-bold` explicitly to the `<motion.h1>` to make the intent clear and guard against future font loader changes.

---

- [ ] **Step 1: Delete the `scaleRule` animation helper**

In `Hero.tsx`, remove the `scaleRule` function (lines 52–60 of the current file). Its only call site (line 123 inside the thin rule element) is eliminated automatically by Step 2's full content block replacement — no separate action needed for the call site.

```tsx
// DELETE this entire function:
function scaleRule() {
  if (prefersReducedMotion) return {}
  return {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.5, delay: 0.15, ease: 'easeOut' as const },
    style: { transformOrigin: 'left center' },
  }
}
```

---

- [ ] **Step 2: Replace the content block**

Replace the entire `{/* Content block */}` `motion.div` (from line 108 to line 166) with:

```tsx
{/* Content block — fades and lifts on scroll */}
<motion.div
  className="absolute bottom-16 md:bottom-20 left-8 md:left-16 lg:left-24 right-8 md:right-16 lg:right-24 z-20 flex flex-col md:flex-row items-start md:items-end md:justify-between gap-6"
  style={{ opacity: textOpacity, y: textY }}
>
  {/* Left — copy block */}
  <div>
    {/* Label */}
    <motion.p
      className="text-xs md:text-sm text-white/60 tracking-widest font-sans font-medium uppercase mb-3"
      {...entryFade(0)}
    >
      Nissan Leaf
    </motion.p>

    {/* Headline */}
    <div className="block overflow-hidden mb-4">
      <motion.h1
        className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-none"
        {...clipReveal(0.2)}
      >
        O futuro já não está à espera.
      </motion.h1>
    </div>

    {/* Sub-label + reassurance */}
    <motion.div {...fadeUp(0.5)}>
      <p className="text-sm font-sans font-semibold text-white">
        Reserva já.
      </p>
      <motion.p
        className="text-sm font-sans font-light text-white/60"
        {...fadeUp(0.6)}
      >
        Com certezas. Sem compromisso.
      </motion.p>
    </motion.div>
  </div>

  {/* Right — CTA */}
  <motion.div {...fadeUp(0.8)}>
    <Button variant="primary" onClick={() => scrollTo('reservar')}>
      Reservar agora
    </Button>
  </motion.div>
</motion.div>
```

---

- [ ] **Step 3: Verify the file compiles**

Run TypeScript check and dev server:

```bash
npx tsc --noEmit && npm run dev
```

Expected: zero TypeScript errors; dev server starts at `http://localhost:3000`.

---

- [ ] **Step 4: Visual check — desktop**

Open `http://localhost:3000` at ≥1024px viewport width.

Confirm:
- [ ] `Nissan Leaf` label visible bottom-left, small, grey/muted
- [ ] `O futuro já não está à espera.` headline large, bold, single line — does not wrap
- [ ] `Reserva já.` (semibold white) and `Com certezas. Sem compromisso.` (light, muted) below headline
- [ ] `Reservar agora` button bottom-right — its **bottom edge aligns with the reassurance line**, not the top of the copy block
- [ ] No thin rule, no middot label, no subline paragraph, no `Saber mais` button
- [ ] Content fades and lifts when scrolling down

---

- [ ] **Step 5: Visual check — mobile**

Resize to ≤767px (or use browser devtools device emulation).

Confirm:
- [ ] Copy block and CTA stack vertically, copy on top
- [ ] Both left-aligned (CTA does not stretch full-width)
- [ ] Headline remains readable — does not overflow viewport width

---

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: redesign hero — split bottom bar, new copy, remove decorative layers"
```
