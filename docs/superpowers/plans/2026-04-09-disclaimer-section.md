# Disclaimer Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `DisclaimerSection` component between `InfoFormSection` and `ClosingSection` on the main page, showing legal and product disclaimers as a bulleted list on a white background with grey text.

**Architecture:** One new stateless component at `src/components/sections/DisclaimerSection.tsx`. One line added to `src/app/page.tsx` to mount it. No state, no animations, no external dependencies.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS

---

### Task 1: Create DisclaimerSection component

**Files:**
- Create: `src/components/sections/DisclaimerSection.tsx`

- [ ] **Step 1: Create the component file**

```tsx
export default function DisclaimerSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <ul className="list-disc list-inside space-y-2 text-sm text-[#6B6B6B]">
          <li>
            Os valores apresentados são indicativos e servem apenas para efeitos de comparação.
          </li>
          <li>
            A autonomia de 320 km refere-se ao MICRA 40 kWh e os 415 km referem-se ao MICRA 52 kWh.
            Os resultados reais em uso podem variar dependendo de fatores como o nível inicial de
            carga da bateria, acessórios adicionados após homologação, condições meteorológicas,
            estilos de condução e carga do veículo.
          </li>
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/DisclaimerSection.tsx
git commit -m "feat: add DisclaimerSection component"
```

---

### Task 2: Mount DisclaimerSection in page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

In `src/app/page.tsx`, add this import alongside the other section imports:

```tsx
import DisclaimerSection from '@/components/sections/DisclaimerSection'
```

- [ ] **Step 2: Insert the component between InfoFormSection and ClosingSection**

Replace:
```tsx
        <InfoFormSection />
        <ClosingSection />
```

With:
```tsx
        <InfoFormSection />
        <DisclaimerSection />
        <ClosingSection />
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev` and open `http://localhost:3000`. Scroll to the disclaimer section. Verify:
- White background
- Two grey bullet points with the correct Portuguese text
- Section sits between the contact form and the closing full-screen section

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: mount DisclaimerSection between form and closing"
```
