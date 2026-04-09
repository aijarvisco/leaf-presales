# Disclaimer Section Design

**Date:** 2026-04-09
**Status:** Approved

## Summary

Add a new `DisclaimerSection` between `InfoFormSection` and `ClosingSection` on the main page. The section surfaces legal and product disclaimers in a low-visual-weight, secondary style.

## Component

**File:** `src/components/sections/DisclaimerSection.tsx`

A simple, stateless functional component. No animations, no interactivity.

## Visual Design

- Background: white (`bg-white`)
- Layout: constrained container matching the rest of the page (`max-w-6xl mx-auto px-6`)
- Padding: `py-10`
- No heading
- Bulleted list (`ul`) of disclaimer lines
- Text size: `text-sm`
- Text colour: `text-[#6B6B6B]` (matches existing grey used in form labels and body copy)
- Bullet style: `list-disc list-inside`

## Content

Two bullet points:

1. *Os valores apresentados são indicativos e servem apenas para efeitos de comparação.*
2. *A autonomia de 320 km refere-se ao MICRA 40 kWh e os 415 km referem-se ao MICRA 52 kWh. Os resultados reais em uso podem variar dependendo de fatores como o nível inicial de carga da bateria, acessórios adicionados após homologação, condições meteorológicas, estilos de condução e carga do veículo.*

## Page Integration

In `src/app/page.tsx`, insert `<DisclaimerSection />` between `<InfoFormSection />` and `<ClosingSection />`.

## Out of Scope

- No animations
- No heading or label
- No links
- No responsive variations (single-column layout works at all breakpoints)
