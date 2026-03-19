# Nissan Leaf Pre-order Landing Page — Design Spec
**Date:** 2026-03-19
**Project:** Nissan Leaf Launch Campaign — Portugal
**Status:** Approved

---

## 1. Overview

A single-page, scroll-driven pre-order landing page for the new Nissan Leaf launch in Portugal. The page serves two conversion goals simultaneously: capturing high-intent prospects via a Stripe €300 deposit pre-order, and capturing lower-intent prospects via a Zoho CRM lead form. The experience should feel premium, cinematic, and technically impressive — on par with Apple product pages, Tesla vehicle pages, and the Lightship Atmos page (https://www.lightshiprv.com/atmos).

---

## 2. Goals

**Primary:**
- Allow prospects to complete a pre-order by paying a €300 refundable deposit via Stripe
- Capture leads (name, email, phone) submitted to Zoho CRM for sales team follow-up

**Target audience:**
- Eco-conscious early adopters already interested in EVs
- Design and tech enthusiasts drawn to the Leaf's new modern, curvy visual identity

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React (Next.js) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D Configurator | Three.js with `.glb` model (fallback: pre-rendered image sequence) |
| Payments | Stripe Checkout (server-side via Next.js API route) |
| CRM | Zoho CRM Lead API |
| Deployment | Vercel |
| Language | Portuguese (PT) |

---

## 4. Visual Design System

**Design references (in order of priority):**
1. Apple product pages — typography, spacing, scroll-triggered reveals
2. Tesla vehicle pages — dark aesthetic, full-bleed imagery, minimal UI
3. Lightship Atmos (https://www.lightshiprv.com/atmos) — scroll storytelling, card+modal pattern, cinematic sections

**Palette:**
- Background: deep blacks (`#0A0A0A`, `#111111`)
- Card surfaces: `#1A1A1A`
- Text: white headings (`#FFFFFF`), light gray body copy (`#A1A1A1`)
- Accent (primary fallback until brand assets confirmed): `#0070C9` (Nissan electric blue). If official brand assets provide a different hex, replace this value globally. Electric yellow (`#F5C518`) is an alternative pending brand approval.
- Color used with intention only — never decorative

**Typography:**
- Headings: modern geometric sans-serif (Inter, Geist, or official Nissan brand font if available) — large, confident, generous line height
- Body: small, airy, high line height
- Portuguese throughout

**Motion principles:**
- Scroll-triggered fade-ups and reveals via Framer Motion `whileInView`
- Parallax depth on hero and closing section imagery
- Smooth crossfades for configurator color/view transitions
- AI micro-videos play muted and looping — never autoplay with sound
- Motion is purposeful, never decorative

**Imagery treatment:**
- Full-bleed, edge-to-edge — images never boxed or contained
- Subtle dark overlays only where text legibility requires it
- Official Nissan campaign images mixed with AI-generated micro-videos for dynamism

---

## 5. Page Structure

### 5.1 Hero

**Goal:** Create immediate desire and present both conversion paths upfront.

**Layout:** Fullscreen (`100vh`), dark overlay on looping AI micro-video or cinematic Nissan campaign still.

**Content:**
- Headline (Portuguese, punchy): e.g., *"O futuro chegou. Reserve o seu."*
- Subheadline: one line reinforcing the EV/design angle
- Two CTAs side by side:
  - **"Reservar agora"** (primary) — triggers Stripe pre-order flow
  - **"Ser contactado"** (secondary/ghost) — smooth-scrolls to the CTA section
- Animated scroll indicator at the bottom (chevron or line)

**Behavior:**
- Headline animates in on load (fade + slight upward drift)
- Background parallax effect on scroll
- Dual CTAs establish the two conversion paths immediately

---

### 5.2 Highlights

**Goal:** Quick, visually punchy overview of the Leaf's key differentiators.

**Layout:** Section headline followed by 3–4 horizontal side-by-side cards.

**Section headline:** e.g., *"Feito para te surpreender."*

**Each card:**
- Tall image or looping AI micro-video (edge-to-edge within card)
- Short bold label (e.g., *"Design que impressiona"*)
- One sentence of supporting copy
- Card background: `#1A1A1A`

**Suggested card themes:**
1. Design exterior — new curvy, modern silhouette
2. Interior & tecnologia — digital cockpit, connectivity
3. Autonomia — range and charging speed stat
4. Zero emissões — sustainability

**Behavior:**
- Cards animate in with staggered fade-up on scroll entry
- Mobile: horizontal scroll carousel

---

### 5.3 360 Configurator

**Goal:** Let prospects explore and personalize the vehicle — building emotional attachment before the CTA.

**Layout:** Full-width dark section.

**Section headline:** e.g., *"Descobre o teu Leaf."*

**Structure:**
- **View toggle:** Tabs — *"Exterior"* / *"Interior"*
- **Viewer:** Interactive 3D or rotation viewer (see technical note below)
- **Color switcher:** Row of circular swatches below viewer; clicking swaps color in real time with a crossfade animation

**Technical implementation:**
- **Target:** Three.js with official Nissan `.glb` 3D model (to be sourced from Nissan importer)
- **Fallback:** Pre-rendered image sequence with drag/swipe-to-rotate interaction — same UX feel, no 3D model dependency
- Both paths should be built in parallel and toggled via an environment variable (`NEXT_PUBLIC_CONFIGURATOR_MODE=3d` or `image-sequence`). The component API is identical in both cases — only the renderer differs.

**Available colors and interior variants:** TBD — to be confirmed with official Nissan asset list.

**Mobile:** Drag-to-rotate becomes swipe-to-rotate; color swatches remain tappable.

---

### 5.4 Range & Savings

**Goal:** Quantify the Leaf's value proposition and make savings tangible and personal.

**Layout:** Dark section with bold headline, followed by 3–4 horizontal side-by-side cards (same grid as Highlights).

**Section headline:** e.g., *"Vai mais longe. Carrega mais rápido."*

**Each card:**
- Visual or icon at top
- Large stat headline (e.g., *"450 km"*)
- Short descriptor line
- Subtle *"Calcular"* / *"Saber mais"* affordance indicating it's clickable

**Suggested cards:**
1. **Autonomia** — max range (km)
2. **Carregamento** — fast charge speed (0–80% time)
3. **Poupança** — cost savings vs. combustion
4. **Emissões** — CO₂ avoided per year

**On card click — Modal:**
- Full-screen modal (blurred background, dark overlay) animates in with scale+fade
- Topic expanded with detail and imagery
- **Poupança card specifically:** includes interactive savings calculator
  - Inputs (sliders or number fields): monthly fuel spend (€), km/month, electricity tariff (€/kWh, pre-filled with `€0.22/kWh` — Portuguese residential average as of 2025)
  - Real-time output (no submit): monthly savings (€), annual savings (€), CO₂ avoided (kg/year)
- Close button (×) top right; Escape key also closes
- Mobile: modal is full-screen

---

### 5.5 Pre-order & Contact CTAs

**Goal:** Convert prospects — either via Stripe deposit or lead form.

**Layout:** High-contrast section with cinematic background image or subtle micro-video loop. Two paths side by side, separated by a vertical divider.

**Left — Stripe Pre-order:**
- Headline: *"Reserva o teu Leaf hoje."*
- Copy: *"Garante o teu lugar com um depósito de €300, totalmente reembolsável."*
- CTA button: **"Reservar agora"**
- Trust signals below: lock icon + *"Pagamento seguro"* + refund policy note

**Right — Contact Form:**
- Headline: *"Preferes falar primeiro?"*
- Copy: *"A nossa equipa está pronta para responder a todas as tuas dúvidas."*
- Inline form fields: First Name, Last Name, Email, Phone, Preferred contact time (optional)
- Submit button: *"Enviar"*
- On submit: POST to Zoho CRM Lead API; inline success confirmation shown

**Stripe flow:**
1. User clicks *"Reservar agora"*
2. Next.js API route creates a Stripe Checkout Session (€300)
3. User is redirected to Stripe's hosted checkout page
4. On success: redirected to `/obrigado` confirmation page
5. On cancel: returned to landing page

**GDPR:** Form submission requires explicit consent checkbox. Data processing notice clearly displayed.

**Mobile:** Sections stack vertically — Stripe CTA first, form below.

---

### 5.6 Version Comparison

**Goal:** Help prospects understand the three trim levels and choose the right one before committing.

**Layout:** Dark section with headline (*"Escolhe a tua versão."*) and a 3-column comparison table. Three columns is the assumed structure (one per trim level). If official data arrives with fewer than 3 versions, the missing column is simply removed — the layout is fluid.

**Table structure:**
- Header row: version name + starting price (e.g., *"Visia — desde €29,990"*)
- Featured/recommended version (middle column by default): subtle lighter card background or accent border + *"Mais popular"* badge
- Equipment rows: checkmark (✓) or dash (—) per version
- Bottom row per column: *"Reservar"* CTA (Stripe, version pre-filled) + *"Saber mais"* (scrolls to contact form)

**Equipment categories** (to be filled with official spec data):
- Exterior (wheels, lights, colour options)
- Interior (upholstery, screen size, sound system)
- Safety & driver assist features
- Connectivity & tech
- Warranty / service inclusions

**Behavior:**
- Table animates in on scroll
- Mobile: horizontal swipe carousel — one version visible at a time

---

### 5.7 Closing & Footer

**Goal:** Leave a lasting visual impression and capture last-chance conversions.

**Layout:** Fullscreen (`100vh`) — the best available Nissan Leaf campaign image, edge-to-edge, no overlay panels. Content floats on top of the image.

**Content centered on screen:**
- Closing headline: *"O futuro é elétrico. E é agora."*
- Two CTAs: **"Reservar agora"** (primary) + **"Ser contactado"** (secondary/ghost)

**Footer bar** — thin strip pinned to the bottom of the section:
- *© 2026 Nissan Portugal* · Política de Privacidade · Termos e Condições · Cookies · Contacto
- Nissan logo left-aligned or centered

**Behavior:**
- Background: slow subtle zoom or parallax on scroll entry
- Headline and CTAs: fade in last, drawing eye naturally
- Image does the emotional heavy lifting — motion is minimal

**GDPR:** Cookie consent is handled by a third-party solution (to be chosen from open items). The vendor's default placement and styling will be used — no custom placement will be enforced in code, to avoid conflicts with the vendor's own rendering logic.

---

## 6. Navigation

A minimal sticky navigation bar appears once the user has scrolled past the hero — triggered when the hero section exits the viewport (i.e., `scrollY > 100vh`). It is hidden at the very top so the hero is uninterrupted.
- Nissan Leaf wordmark / logo left
- Anchor links to key sections: Highlights · Configurador · Autonomia · Versões
- **"Reservar"** CTA button right-aligned (always visible)

---

## 7. Additional Pages

| Route | Purpose |
|-------|---------|
| `/` | Main landing page |
| `/obrigado` | Post-Stripe success confirmation page |

### `/obrigado` — Success Page

Displayed after a successful Stripe Checkout. Receives `?session_id={CHECKOUT_SESSION_ID}` as a query parameter.

**Content:**
- Nissan Leaf logo or wordmark at top
- Large confirmation headline: *"Reserva confirmada. Bem-vindo ao futuro."*
- Supporting copy: *"O teu depósito de €300 foi recebido. A nossa equipa irá entrar em contacto em breve para confirmar os detalhes da tua encomenda."*
- Order summary (retrieved server-side from Stripe using `session_id`): customer email, amount paid, reservation reference (Stripe Payment Intent ID)
- Two CTAs: **"Voltar ao início"** (returns to `/`) + **"Ser contactado"** (links to the contact form section on `/`)
- Cinematic background image (same dark aesthetic as the main page)

**No auth required.** The page is stateless — all data is fetched from Stripe on render using the session ID.

---

## 8. Integrations

### Stripe
- Server-side Checkout Session created via Next.js API route (`/api/checkout`)
- Product: *"Nissan Leaf — Depósito de Reserva"*, amount: €300
- Success URL: `/obrigado?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/`
- Version selection passed as metadata to the Checkout Session

### Zoho CRM
- Form submits via POST to Zoho CRM Lead API
- Fields mapped: First Name, Last Name, Email, Phone, Lead Source (*"Leaf Landing Page"*), preferred contact time (as description/note)
- Confirmation: inline success message (no page redirect)

---

## 9. Assets & Content

| Asset | Status |
|-------|--------|
| Official Nissan campaign images | Available (partial) |
| AI-generated micro-videos | In production |
| 3D vehicle model (`.glb`) | To be sourced from Nissan importer |
| Pre-rendered image sequence (fallback) | To be produced if 3D model unavailable |
| Vehicle specs & pricing (3 versions) | TBD — from official Nissan PT |
| Equipment comparison data | TBD — from official Nissan PT |
| Brand fonts | TBD — confirm if Nissan brand font is available for web use |
| Copy (PT) | To be written — headlines provided as examples in this spec |

---

## 10. Responsive Behavior Summary

| Section | Mobile adaptation |
|---------|------------------|
| Hero | Full-screen, CTAs stack vertically |
| Highlights | Horizontal scroll carousel |
| Configurator | Swipe-to-rotate; tappable swatches |
| Range & Savings | Horizontal scroll carousel; modals full-screen |
| CTAs | Stripe section above, form below |
| Version Comparison | Horizontal swipe carousel |
| Closing | Full-screen image, CTAs stack |

---

## 11. Open Items

- [ ] Confirm availability of Nissan `.glb` 3D model via importer
- [ ] Confirm official brand font licensing for web use
- [ ] Obtain official spec sheet and pricing for the 3 trim levels
- [ ] Confirm final color options available for Portugal market
- [ ] Define exact Stripe product/price IDs
- [ ] Confirm Zoho CRM API credentials and field mapping
- [ ] Define copy for all sections in final Portuguese
- [ ] Confirm dealership/importer name for legal footer
- [ ] Define cookie consent solution (e.g., CookieYes, Cookiebot, custom)
