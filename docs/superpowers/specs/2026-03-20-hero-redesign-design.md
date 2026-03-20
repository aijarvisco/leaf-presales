# Hero Redesign — Design Spec
**Date:** 2026-03-20

## Problem

The current hero has too many competing layers: an eyebrow label with middots, a decorative thin rule, a two-line italic/roman contrast headline, a subline paragraph, and two CTAs. The result is noisy and unconvincing — no single element lands with authority.

## Design Direction

Inspired by Apple's product hero pattern (AirPods Max 2 reference): full-bleed video background, copy anchored bottom-left, CTA anchored bottom-right, breathing room in the center.

## Layout

Bottom bar split — two anchored poles at the same baseline:

**Left (copy block)**
1. Label: `Nissan Leaf` — small, medium weight
2. Headline: `O futuro já não está à espera.` — large, bold, single line
3. Sub-label: `Reserva já.` — small, bold
4. Reassurance line: `Com certezas. Sem compromisso.` — small, light weight

**Right (CTA)**
- Single pill/button: `Reservar agora`
- `Saber mais` is removed — the left copy handles reassurance

## What Gets Removed

- Decorative thin rule (`w-12 border-t border-white/30`)
- Eyebrow label with middots (`Nissan Leaf · 100% Elétrico · Reserva Antecipada`)
- Subline paragraph (`O Nissan Leaf foi construído para quem nunca parou de imaginar.`)
- Second CTA button (`Saber mais`)
- Italic/roman two-line headline contrast

## Typography

The headline needs to feel bold and confident at large size. Cormorant bold variants are acceptable; if the bold weight reads as too decorative at render time, fall back to the existing sans-serif font. This is a judgment call at implementation — both options are valid.

Scroll-driven fade and lift animations on the content block are retained. Entry animations (clipReveal, fadeUp) are simplified to match the reduced number of elements.

## Scroll Behaviour

Retained as-is:
- Content block fades and lifts on scroll (`textOpacity`, `textY`)
- Video Ken Burns scale on scroll (`videoScale`)
- Bottom gradient darkens on scroll (`gradientOpacity`)

## Vignette Layers

Retained as-is — left edge vignette, top vignette, and bottom-to-solid gradient all stay. They provide the contrast needed for white text over video.
