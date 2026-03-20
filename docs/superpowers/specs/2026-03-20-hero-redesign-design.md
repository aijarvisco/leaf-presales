# Hero Redesign — Design Spec
**Date:** 2026-03-20

## Problem

The current hero has too many competing layers: an eyebrow label with middots, a decorative thin rule, a two-line italic/roman contrast headline, a subline paragraph, and two CTAs. The result is noisy and unconvincing — no single element lands with authority.

## Design Direction

Inspired by Apple's product hero pattern (AirPods Max 2): full-bleed video background, copy anchored bottom-left, CTA anchored bottom-right, breathing room in the center.

## Layout

A single bottom container uses `flex justify-between items-end` pinned to the bottom of the section (`absolute bottom-16 md:bottom-20 left-8 md:left-16 lg:left-24 right-8 md:right-16 lg:right-24`). The two poles — copy block and CTA — sit at the same baseline.

**Left (copy block)**
1. Label: `Nissan Leaf` — `text-xs md:text-sm`, `font-sans font-medium`, `text-white/60`, `tracking-widest uppercase`
2. Headline: `O futuro já não está à espera.` — `font-sans font-bold`, `text-5xl md:text-6xl lg:text-7xl`, `text-white leading-none`, single line
3. Sub-label: `Reserva já.` — `text-sm`, `font-sans font-semibold`, `text-white`, `mt-4`
4. Reassurance line: `Com certezas. Sem compromisso.` — `text-sm`, `font-sans font-light`, `text-white/60`

**Right (CTA)**
- Single `<Button variant="primary">Reservar agora</Button>` — existing component, already `rounded-full`
- Aligned to `items-end` via the flex container — no separate absolute positioning needed
- `Saber mais` button removed entirely

**Mobile (below `md`)**
The flex container switches to `flex-col items-start gap-6`: copy block on top, CTA below, both left-aligned. This matches standard stacking behaviour for narrow viewports.

## What Gets Removed

- Decorative thin rule (`w-12 border-t border-white/30`)
- Eyebrow label with middots (`Nissan Leaf · 100% Elétrico · Reserva Antecipada`)
- Subline paragraph (`O Nissan Leaf foi construído para quem nunca parou de imaginar.`)
- Second CTA button (`Saber mais`)
- Italic/roman two-line headline contrast
- `scaleRule()` animation helper function (no longer used)

## Entry Animations

`prefersReducedMotion` guard retained on all animations. Delays are approximate — tune at render time.

| Element | Animation | Delay |
|---|---|---|
| Label | `entryFade` | 0 |
| Headline | `clipReveal` | 0.2 |
| Sub-label | `fadeUp` | 0.5 |
| Reassurance line | `fadeUp` | 0.6 |
| CTA button | `fadeUp` | 0.8 |

`scaleRule` is deleted. `entryFade`, `clipReveal`, and `fadeUp` are retained.

## Scroll Behaviour

Retained as-is:
- Content block fades and lifts on scroll (`textOpacity`, `textY`) — applied to the outer flex container
- Video Ken Burns scale on scroll (`videoScale`)
- Bottom gradient darkens on scroll (`gradientOpacity`)

## Vignette Layers

All three retained unchanged:
- Top vignette (dims sky)
- Bottom-to-solid gradient (darkens on scroll)
- Left edge vignette (contrast for text)

## Typography Note

**Primary path: `font-sans font-bold`** (Space Grotesk). This is the safest default — the font is already loaded, and it matches the bold confident register of the reference.

Cormorant is loaded at weight `300` only (`layout.tsx`), so `font-cormorant font-bold` will silently synthesise a fake-bold. Additionally, `globals.css` applies `font-family: var(--font-family-heading)` (Space Grotesk) to all `h1` elements, overriding `font-cormorant` unless explicitly countered. To use Cormorant bold, a developer would need to add `weight: ['300', '700']` to the Cormorant loader in `layout.tsx` and override the global `h1` style. That is optional — evaluate at render time.

Font-size tokens (`text-5xl md:text-6xl lg:text-7xl`) apply regardless of font family. Verify single-line fit at `lg` before shipping.

## CTA Behaviour

The `Reservar agora` button retains `onClick={() => scrollTo('reservar')}` — same scroll target as the current primary CTA. The `scrollTo` helper stays in the component unchanged.

CTA button width on mobile: natural (`inline-flex`, auto width). No full-width treatment needed.
