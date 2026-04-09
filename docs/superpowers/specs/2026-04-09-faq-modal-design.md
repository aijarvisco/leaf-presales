# FAQ Modal — Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Overview

Add a "Perguntas Frequentes" CTA to the `InfoFormSection` submission form. When clicked, opens the existing `Modal` (bottom-sheet portal) with a title, intro paragraph, and an accordion list of 11 FAQs.

## Placement

In `src/components/sections/InfoFormSection.tsx`, inside the left column motion div, between the intro paragraph (`"Preencha o formulário..."`) and the `<form>` element.

## CTA Button

- Label: `PERGUNTAS FREQUENTES`
- Icon: circled `+` SVG to the left of the text (same visual language as the modal close button)
- Style: no background, no border — inline minimal style. Bold uppercase tracking-widest text. Slight opacity on hover.
- On click: sets `faqOpen` state to `true`

## Modal

Reuses the existing `Modal` component from `src/components/ui/Modal.tsx` (bottom-sheet portal, backdrop blur, Escape key + backdrop click to close).

### Modal Content Layout

1. **Header block** (padded, `px-6 pt-2 pb-6`)
   - Title: `"Tudo o que precisas de saber"` — `text-2xl font-medium tracking-[-0.04em] text-[#0A0A0A]`
   - Paragraph: `"Reunimos as perguntas mais comuns sobre o Nissan LEAF. Se tiveres mais dúvidas, a nossa equipa está disponível para ajudar."` — `text-sm text-[#86868b] mt-2`

2. **FAQ Accordion** (`px-6 pb-10`)
   - Divider line at the top
   - Each item: question row + collapsible answer
   - Question row: full-width button, question text left-aligned, `+` / `−` icon right-aligned
   - Answer: expands below the question row with a smooth CSS transition (`max-height` or framer-motion `AnimatePresence`)
   - Divider line between each item
   - One item open at a time (`openIndex: number | null` state); clicking open item closes it

## State

Two new state variables added to `InfoFormSection`:
- `faqOpen: boolean` — controls modal visibility
- `faqIndex: number | null` — tracks which FAQ item is expanded (`null` = all closed)

## Data

FAQ content defined as `FAQ_ITEMS: { q: string; a: string }[]` constant at the top of `InfoFormSection.tsx`.

### FAQ Items

1. **Qual é a autonomia real do Nissan LEAF?**
   O Nissan LEAF oferece até 592 km de autonomia em ciclo WLTP. A autonomia real pode variar consoante o estilo de condução, temperatura ambiente e utilização de sistemas de climatização.

2. **Quanto tempo demora a carregar?**
   Em carregamento rápido (CHAdeMO), passa de 20% a 80% em apenas 30 minutos. Em carregamento AC em casa (7,4 kW), uma carga completa demora aproximadamente 8 horas.

3. **Posso instalar um carregador em casa?**
   Sim. A Nissan disponibiliza soluções de carregamento doméstico (Wallbox) compatíveis com o LEAF. A instalação é simples e pode ser feita por um electricista certificado.

4. **Quais são as vantagens fiscais em Portugal?**
   Os veículos elétricos estão isentos de IUC e beneficiam de redução de ISV. Empresas podem ainda deduzir 100% do custo de aquisição em IRC.

5. **A bateria tem garantia?**
   Sim. A bateria do Nissan LEAF tem garantia de 8 anos ou 160 000 km, cobrindo degradação abaixo de 9 células de capacidade.

6. **Qual o custo médio por km em eletricidade?**
   Com um consumo de 17 kWh/100 km e tarifa média de 0,15 €/kWh, o custo por km é de aproximadamente 0,026 €, face a 0,11 €/km num veículo a combustão.

7. **Por que devo reservar agora?**
   Ao reservar, garantes prioridade na entrega quando o teu LEAF estiver disponível, além de acesso antecipado a condições especiais de lançamento. O número de reservas é limitado.

8. **Quanto custa fazer uma reserva?**
   A reserva tem um valor de 250 €, totalmente deduzido no momento da compra do veículo.

9. **Posso cancelar a minha reserva?**
   Sim, podes cancelar a qualquer momento antes da confirmação final da encomenda. O valor da reserva é reembolsado na totalidade, sem qualquer penalização.

10. **O que acontece depois de reservar?**
    Um representante Nissan entrará em contacto contigo em breve para confirmar os detalhes, discutir opções de financiamento e agendar um test drive.

11. **A minha reserva compromete-me a comprar o veículo?**
    Não. A reserva é uma manifestação de interesse prioritária — não existe qualquer compromisso de compra. Podes cancelar e ser reembolsado a qualquer momento.

## Implementation Location

Single file change: `src/components/sections/InfoFormSection.tsx`

- Add `FAQ_ITEMS` const
- Add `faqOpen` and `faqIndex` state
- Add `FAQAccordion` sub-component (inline, bottom of file alongside existing field helpers)
- Add CTA button in JSX between paragraph and form
- Add `<Modal>` with FAQ content at end of section JSX
