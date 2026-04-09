# Copy Update — Nissan Leaf Presales Page

**Date:** 2026-04-09  
**Source of truth:** `src/data/copy.md`  
**Approach:** Direct inline edits to each component (no new abstractions)

---

## Scope

Update hardcoded copy in 5 files to match `src/data/copy.md` exactly.

---

## Changes per file

### `src/components/sections/Hero.tsx`

| Element | Before | After |
|---|---|---|
| Label `<p>` | "Novo Nissan Leaf" | "Nissan Leaf. Nova Geração." |
| Headline `<h1>` | "O futuro da inteligência elétrica" | "A energia que vai mover a sua vida" |
| Sub `<p>` | "Disponível para entrega em Outubro." | "Primeiras entregas - limitadas - a partir de Outubro" |

---

### `src/components/sections/Highlights.tsx`

Exterior design carousel. Currently 3 cards → becomes 4 cards.

| # | Bold | Body |
|---|---|---|
| 1 | Linhas aerodinâmicas | Belo e eficiente. Menos resistência ao vento significa mais quilómetros com a mesma energia. |
| 2 *(new)* | Visualmente inteligente | Da forma à função, até aos detalhes de acabamento, o Nissan LEAF é tão elegante quanto inteligente. |
| 3 | Iluminação traseira marcante | Os faróis traseiros 3D do Nissan LEAF, conferem um aspeto futurista. |
| 4 | Espaço para Explorar. | Compacto o suficiente para ser manobrado facilmente, sem comprometer o espaço do habitáculo. |

Card 2 has no dedicated image in `public/images/highlights/`. Uses `/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg` (exterior press shot) as a stand-in until a proper image is provided.

---

### `src/app/page.tsx` — `INTERIOR_CARDS`

Order changes and all copy updated:

| # | Bold | Body |
|---|---|---|
| 1 | Conduza com conforto. | O piso plano cria um habitáculo amplo, proporcionando a viagem mais confortável possível. |
| 2 | Assuma o controlo. | Dois ecrãs de 14,3" oferecem acesso claro, conveniente e intuitivo ao NissanConnect com Google integrado. |
| 3 | Mergulhe no som envolvente | Desfrute do sistema de som Bose, com 9 altifalantes, dois deles integrados no encosto de cabeça do condutor. |
| 4 | Todos a bordo | Espaço para toda a família num dos 5 lugares do Nissan LEAF |

Images remain the same; order changes to match copy.md sequence.

---

### `src/components/sections/AutonomiaSectionV2.tsx`

| Element | Before | After |
|---|---|---|
| Label `<p>` | "Autonomia" | "Autonomia" *(unchanged)* |
| Headline `<h2>` | "Uma bateria que vai onde tu vais." | "Excelência elétrica para chegar mais longe" |
| Stat 2 number | "592" km | "622" km |
| Stat 2 descriptor | "Autonomia em ciclo WLTP" | "Autonomia." |
| Stat 3 qualifier | "" | "8" |
| Stat 3 number | "30" | "anos" |
| Stat 3 unit | "min" | *(merged into number)* |
| Stat 3 descriptor | "De 20 a 80% em carga rápida" | "de garantia na bateria" |
| Calculator button | "Calculadora de Poupança EV" | "Calcule o que vai poupar" |

Stat 3 restructure: `{ qualifier: '', number: '8', unit: 'anos', descriptor: 'de garantia na bateria' }`

---

### `src/components/sections/ClosingSection.tsx`

| Element | Before | After |
|---|---|---|
| Headline | "Não imagine mais.\nConduza-o." | "Chega de imaginar. É hora de conduzir." |
| Contact label | "Ser Contactado" | "Fale connosco" |
| Contact body | "Tem dúvidas? Nós respondemos." | "Tem dúvidas? A nossa equipa responde em menos de 24 horas." |
| Reserve label | "Reservar Agora" | "Reservar" |
| Reserve body | "Garanta o seu lugar com 300€ totalmente reembolsáveis." | "300€ totalmente reembolsáveis · Garanta o seu lugar entre os primeiros. Sem compromisso, sem risco." |

---

## Out of scope

- Layout, styling, animations — unchanged
- `ValuesSection` component props for battery-highlights section in `page.tsx` — unchanged (not referenced in copy.md)
- `DesignIntroSection` interior label/heading — unchanged (matches copy.md already: "Interior" / "Espaço para todas as suas aventuras.")
