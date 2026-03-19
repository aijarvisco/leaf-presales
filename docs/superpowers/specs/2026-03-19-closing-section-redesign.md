# Closing Section Redesign

**Date:** 2026-03-19
**Reference:** AE.1 "Begin your journey" closing section

## Goal

Make the `ClosingSection` feel more elegant and cinematic — headline centered on the car, warm golden-hour mood, cleaner CTA cards.

## Layout Changes

### `<section>`
- Remove `flex flex-col` from the class list
- Final classes: `relative h-screen overflow-hidden`

### Spacer `<div>` between headline and CTA
- Delete entirely (it was only needed to push the CTA to the bottom in flex-column layout)

### Headline `motion.div`
- Remove: `pt-20 px-6 max-w-5xl mx-auto w-full`
- Add: `absolute left-6 right-6 top-1/2 -translate-y-[60%] text-center`
- Change `initial={{ opacity: 0, y: -20 }}` → `initial={{ opacity: 0, y: -10 }}`
- All other animation props (`whileInView`, `viewport`, `transition`) unchanged

### CTA bar `motion.div`
- Remove: `max-w-5xl mx-auto w-full px-6 pb-12`
- Add: `absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pb-12`
- This keeps the width constraint on wide screens while pinning to bottom
- All animation props unchanged

## Gradient

Replace current `bg-gradient-to-b from-black/70 via-transparent via-50% to-black/80` with:

```
bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75
```

This shifts the mood from a neutral dark to a warm golden-hour tone that matches the car imagery.

## CTA Cards

Outer container (`div` wrapping both buttons): unchanged — `flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-xl`

### Left card ("Ser contactado")

| Property | Current | New |
|----------|---------|-----|
| Background | `bg-black/65` | `bg-neutral-900/80` (dark grey, not pure black) |
| Hover | `hover:bg-black/75` | `hover:bg-neutral-900/90` |
| Border | `border-r border-white/10` | **remove** (colour contrast with coral card provides separation) |
| Body text size | `text-sm font-light` | `text-base font-light` |
| Sub-text | `<span className="text-xs text-white/35">Sem compromisso</span>` | **delete entirely** |
| Arrow button | `w-7 h-7 rounded-full border border-white/20 group-hover:border-white/50` | `w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200` — remove all `border` and `group-hover:border-*` classes |

### Right card ("Reservar agora")

Brand colour intentionally shifted from Nissan red to warm coral to match the golden-hour mood of the section. This is a deliberate departure from the brand red, specific to this cinematic closing section.

| Property | Current | New |
|----------|---------|-----|
| Background | `bg-[#C3002F]` | `bg-[#E07055]` |
| Hover | `hover:bg-[#a8002a]` | `hover:bg-[#CC6249]` |
| Body text size | `text-sm font-light` | `text-base font-light` |
| Sub-text | `<span className="text-xs text-white/50">Pagamento seguro via Stripe</span>` | **delete entirely** |
| Arrow button | `w-7 h-7 rounded-full border border-white/30 group-hover:border-white/60` | `w-8 h-8 rounded-full bg-neutral-900/25 hover:bg-neutral-900/40 transition-colors duration-200` — remove all `border` and `group-hover:border-*` classes |

## Text Scope

`text-base` applies **only** to the two main body paragraphs (one per card). Labels (`text-[10px]`) are unchanged. The removed sub-text lines (`text-xs`) are deleted — do not replace them.

## Animations

Both `motion.div` wrappers keep their `whileInView / viewport: { once: true }` triggers. Only the headline `initial.y` changes from `-20` to `-10`.

## Files Changed

- `src/components/sections/ClosingSection.tsx` — only file touched
