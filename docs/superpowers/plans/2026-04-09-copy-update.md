# Copy Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update hardcoded copy in 5 files to match `src/data/copy.md` exactly.

**Architecture:** Direct inline string replacements — no new abstractions, no layout changes, no new files (except one new card entry in Highlights). All changes are confined to the HIGHLIGHTS array, INTERIOR_CARDS array, and inline JSX text nodes.

**Tech Stack:** Next.js (App Router), TypeScript, React, Framer Motion

---

## File Map

| File | Change type |
|---|---|
| `src/components/sections/Hero.tsx` | 3 string replacements |
| `src/components/sections/Highlights.tsx` | Replace 3-card HIGHLIGHTS array with 4-card version |
| `src/app/page.tsx` | Replace INTERIOR_CARDS array (copy + reorder) |
| `src/components/sections/AutonomiaSectionV2.tsx` | STATS array + h2 + button text |
| `src/components/sections/ClosingSection.tsx` | 5 string replacements |

---

### Task 1: Create feature branch

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout -b copy/2026-04-09-copy-update
```

Expected output: `Switched to a new branch 'copy/2026-04-09-copy-update'`

---

### Task 2: Update Hero.tsx copy

**Files:**
- Modify: `src/components/sections/Hero.tsx:92,101,110`

Three text replacements:

| Location | Before | After |
|---|---|---|
| Label `<p>` (line 92) | `Novo Nissan Leaf` | `Nissan Leaf. Nova Geração.` |
| `<h1>` (line 101) | `O futuro da inteligência elétrica` | `A energia que vai mover a sua vida` |
| Reassurance `<p>` (line 110) | `Disponível para entrega em Outubro.` | `Primeiras entregas - limitadas - a partir de Outubro` |

- [ ] **Step 1: Replace label text**

In `src/components/sections/Hero.tsx`, change line 92:
```tsx
            Nissan Leaf. Nova Geração.
```

- [ ] **Step 2: Replace headline text**

Change line 101:
```tsx
              A energia que vai mover a sua vida
```

- [ ] **Step 3: Replace reassurance text**

Change line 110:
```tsx
            Primeiras entregas - limitadas - a partir de Outubro
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "copy: update Hero label, headline, and reassurance text"
```

---

### Task 3: Update Highlights.tsx (3 → 4 cards)

**Files:**
- Modify: `src/components/sections/Highlights.tsx:7-26`

Replace the entire `HIGHLIGHTS` const (lines 7–26). The new array has 4 entries — the original order is restructured: aerodynamic stays first, a new card is inserted second, lights becomes third, dimensions becomes fourth. All bold/body copy is updated to match `copy.md`.

- [ ] **Step 1: Replace HIGHLIGHTS array**

Replace the block from `const HIGHLIGHTS = [` through the closing `]` with:

```tsx
const HIGHLIGHTS = [
  {
    imageSrc: '/images/highlights/nissan_leaf_aerodynamic.jpeg',
    imageAlt: 'Silhueta aerodinâmica do Nissan Leaf',
    description: <><strong>Linhas aerodinâmicas</strong> Belo e eficiente. Menos resistência ao vento significa mais quilómetros com a mesma energia.</>,
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Vista exterior do Nissan Leaf',
    description: <><strong>Visualmente inteligente</strong> Da forma à função, até aos detalhes de acabamento, o Nissan LEAF é tão elegante quanto inteligente.</>,
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/highlights/nissan_leaf_lights.jpeg',
    imageAlt: 'Faróis traseiros 3D do Nissan Leaf',
    description: <><strong>Iluminação traseira marcante</strong> Os faróis traseiros 3D do Nissan LEAF, conferem um aspeto futurista.</>,
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/highlights/nissan_leaf_dimensions.jpg',
    imageAlt: 'Dimensões do Nissan Leaf',
    description: <><strong>Espaço para Explorar.</strong> Compacto o suficiente para ser manobrado facilmente, sem comprometer o espaço do habitáculo.</>,
    textPosition: 'bottom' as const,
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Highlights.tsx
git commit -m "copy: update Highlights to 4 cards with new exterior copy"
```

---

### Task 4: Update INTERIOR_CARDS in page.tsx

**Files:**
- Modify: `src/app/page.tsx:3-28`

Replace the entire `INTERIOR_CARDS` const (lines 3–28). Copy changes for all 4 cards; order changes: bose_sound moves from position 4 to position 3, space moves from position 3 to position 4.

- [ ] **Step 1: Replace INTERIOR_CARDS array**

Replace the block from `const INTERIOR_CARDS = [` through the closing `]` (lines 3–28) with:

```tsx
const INTERIOR_CARDS = [
  {
    imageSrc: '/images/interior/nissan_leaf_confortable.webp',
    imageAlt: 'Nissan Leaf — interior confortável',
    boldText: 'Conduza com conforto.',
    bodyText: 'O piso plano cria um habitáculo amplo, proporcionando a viagem mais confortável possível.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_display.webp',
    imageAlt: 'Nissan Leaf — portal de infoentretenimento',
    boldText: 'Assuma o controlo.',
    bodyText: 'Dois ecrãs de 14,3" oferecem acesso claro, conveniente e intuitivo ao NissanConnect com Google integrado.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_bose_sound.webp',
    imageAlt: 'Nissan Leaf — sistema de áudio Bose',
    boldText: 'Mergulhe no som envolvente',
    bodyText: 'Desfrute do sistema de som Bose, com 9 altifalantes, dois deles integrados no encosto de cabeça do condutor.',
  },
  {
    imageSrc: '/images/interior/nissan_leaf_space.webp',
    imageAlt: 'Nissan Leaf — cinco lugares reais',
    boldText: 'Todos a bordo',
    bodyText: 'Espaço para toda a família num dos 5 lugares do Nissan LEAF',
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "copy: update and reorder INTERIOR_CARDS to match copy.md"
```

---

### Task 5: Update AutonomiaSectionV2.tsx

**Files:**
- Modify: `src/components/sections/AutonomiaSectionV2.tsx:8-12,69,84`

Changes:
- STATS array: update stat 2 (592→622, descriptor change) and stat 3 (restructure to 8 anos de garantia)
- h2 headline text
- Calculator button label

- [ ] **Step 1: Replace STATS array**

Replace lines 8–12 (the `const STATS` block) with:

```tsx
const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',   descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '622', unit: 'km',     descriptor: 'Autonomia.' },
  { qualifier: '',    number: '8',   unit: 'anos',   descriptor: 'de garantia na bateria' },
]
```

- [ ] **Step 2: Replace h2 text**

Change line 69 from:
```tsx
            Uma bateria que vai onde tu vais.
```
to:
```tsx
            Excelência elétrica para chegar mais longe
```

- [ ] **Step 3: Replace calculator button label**

Change line 84 from:
```tsx
              Calculadora de Poupança EV
```
to:
```tsx
              Calcule o que vai poupar
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/AutonomiaSectionV2.tsx
git commit -m "copy: update autonomia headline, stats, and calculator button"
```

---

### Task 6: Update ClosingSection.tsx

**Files:**
- Modify: `src/components/sections/ClosingSection.tsx:49-53,67,71,87,91`

Five replacements:

| Location | Before | After |
|---|---|---|
| h2 (lines 50-53) | `Não imagine mais.<br/>Conduza-o.` | `Chega de imaginar. É hora de conduzir.` (single line, no `<br />`) |
| Contact label (line 67) | `Ser Contactado` | `Fale connosco` |
| Contact body (line 71) | `Tem dúvidas? Nós respondemos.` | `Tem dúvidas? A nossa equipa responde em menos de 24 horas.` |
| Reserve label (line 87) | `Reservar Agora` | `Reservar` |
| Reserve body (line 91) | `Garanta o seu lugar com 300€ totalmente reembolsáveis.` | `300€ totalmente reembolsáveis · Garanta o seu lugar entre os primeiros. Sem compromisso, sem risco.` |

- [ ] **Step 1: Replace h2 — remove `<br />` and update text**

Replace the h2 block (lines 49–53):
```tsx
          <h2 className="leading-none font-medium text-white tracking-[-0.07em] max-w-3xl mx-auto" style={{ fontSize: 'var(--text-display)' }}>
            Não imagine mais.
            <br />
            Conduza-o.
          </h2>
```
with:
```tsx
          <h2 className="leading-none font-medium text-white tracking-[-0.07em] max-w-3xl mx-auto" style={{ fontSize: 'var(--text-display)' }}>
            Chega de imaginar. É hora de conduzir.
          </h2>
```

- [ ] **Step 2: Replace contact label**

Change line 67:
```tsx
                Ser Contactado
```
to:
```tsx
                Fale connosco
```

- [ ] **Step 3: Replace contact body**

Change line 71:
```tsx
                  Tem dúvidas? Nós respondemos.
```
to:
```tsx
                  Tem dúvidas? A nossa equipa responde em menos de 24 horas.
```

- [ ] **Step 4: Replace reserve label**

Change line 87:
```tsx
                Reservar Agora
```
to:
```tsx
                Reservar
```

- [ ] **Step 5: Replace reserve body**

Change line 91:
```tsx
                  Garanta o seu lugar com 300€ totalmente reembolsáveis.
```
to:
```tsx
                  300€ totalmente reembolsáveis · Garanta o seu lugar entre os primeiros. Sem compromisso, sem risco.
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd "/Users/brunombteixeira/Documents/07. Innovation & AI/01. Iniciatives/leaf-presales" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/ClosingSection.tsx
git commit -m "copy: update ClosingSection headline and CTA text"
```

---

## Self-Review

**Spec coverage:**
- Hero.tsx — label, h1, sub ✅
- Highlights.tsx — 3→4 cards, all copy per spec ✅
- page.tsx INTERIOR_CARDS — all 4 cards updated, bose/space reordered ✅
- AutonomiaSectionV2.tsx — h2, stat 2 (622km, "Autonomia."), stat 3 (8 anos de garantia), button ✅
- ClosingSection.tsx — h2, contact label/body, reserve label/body ✅

**Out of scope confirmed not touched:**
- Layout, styling, animations — none modified ✅
- ValuesSection battery-highlights props — not touched ✅
- DesignIntroSection label/heading — not touched ✅

**Placeholder scan:** No TBDs or incomplete steps.

**Type consistency:** No new types introduced; all properties match the existing shape used by HighlightCard and ValuesSection.
