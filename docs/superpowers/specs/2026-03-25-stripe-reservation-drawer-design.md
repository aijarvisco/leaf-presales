# Stripe Reservation Drawer — Design Spec

**Date:** 2026-03-25
**Status:** Approved

## Overview

Replace the scroll-to-section reservation flow with a left-sliding drawer that opens directly from the configurator. The drawer shows the user's current configuration summary and the Stripe payment form in one focused, locked interaction.

## Components & Files

| File | Change |
|---|---|
| `src/components/ui/ReservationDrawer.tsx` | New — left-sliding drawer with config card + Stripe form |
| `src/components/sections/Configurador.tsx` | Add `isDrawerOpen` state; `handleReserve` opens drawer; render `<ReservationDrawer>` inside the component's JSX return |
| `src/components/sections/ClosingSection.tsx` | "Reservar agora" scrolls to `#configurador` instead of `#reservar` |
| `src/app/page.tsx` | Remove `<Configurator />` (legacy), `<CTASection />`, and the `selectedVersion` state + `onSelectVersion` prop plumbing |
| `src/components/sections/CTASection.tsx` | Removed from the page — this is the existing `#reservar` section with the standalone Stripe form and FAQ |

`Configurator` (capital-T) is a legacy component — only `Configurador` is in scope.

## ReservationDrawer Props

```ts
interface ReservationDrawerProps {
  isOpen: boolean
  onClose: () => void
  versionId: string      // required — non-optional, unlike StripePaymentForm's prop
  versionName: string
  colorName: string
  colorImageSrc: string
  price: number
}
```

No `colorHex` prop — the config card shows color by name only, no swatch.

## Visual Layout

**Slide direction:** from the **left** — `left-0`, `-translate-x-full` → `translate-x-0`. Note: this is the mirror image of `ContactDrawer` (which uses `right-0` / `translate-x-full`). Do not copy ContactDrawer's transform/position classes verbatim.

**Width:** `w-full md:w-[420px]`

**Background:** `bg-white` — intentional, matches the light styling of `StripePaymentForm`

**Overlay:** `bg-black/60 backdrop-blur-sm`, fixed inset, z-40. **Decorative only — no `onClick` handler.** This is a deliberate departure from `ContactDrawer` (which closes on overlay click). The overlay blocks all page interaction, so version/color changes while the drawer is open are not possible.

**Portal + SSR guard:** `createPortal` to `document.body` with a `mounted` state guard, following the `ContactDrawer` pattern exactly.

### Drawer header
- Left: "Reserva" — medium weight
- Right: `×` close button with `aria-label="Fechar"` (following `ContactDrawer`)
- Bottom border separator

### Drawer body (scrollable)

**Config card** — white card, rounded corners, light border, padding:
- Left: `80×80px` square image from `colorImageSrc`, `object-cover`, rounded corners
- Right column (stacked):
  - "Nissan Leaf" — bold
  - Version name — regular weight, muted colour
  - Color name + price on one line — small text, muted. Price formatted as `€` + `price.toLocaleString('pt-PT')`. Note: `pt-PT` locale uses a non-breaking space as the thousands separator (e.g. `34490` → `"34 490"`, rendered as `€34 490`), not a period.

**Section intro** — `"Complete a sua reserva"`, medium weight, below the card

**Stripe form** — `<StripePaymentForm versionId={versionId} />`.
- Mounted **only when `isOpen` is true** (conditional render) so it re-mounts fresh on each drawer open
- `versionId` is captured at mount time — do not add it to `StripePaymentForm`'s effect dependency array; the existing `useEffect(() => { load() }, [])` is correct

## Behaviour

| Trigger | Result |
|---|---|
| Click "Reservar agora" in configurator | Opens drawer, locks body scroll |
| ESC key | Closes drawer, restores scroll |
| `×` button | Closes drawer, restores scroll |
| Overlay click | No action — overlay is decorative |
| Payment success | Redirect to `/obrigado` (unchanged) |

**Mobile:** ESC is unavailable on mobile. The `×` button is the only close mechanism — intentional.

**Body scroll lock:** `document.body.style.overflow = 'hidden'` while open, restored on close. Follow `ContactDrawer` pattern.

## Navigation Changes

- `ClosingSection` "Reservar agora" scrolls to `#configurador`. The user then clicks "Reservar agora" in the configurator to open the drawer. This two-step flow is intentional.
- `CTASection` (the `#reservar` section) is removed from the page.
- The `selectedVersion` state and `onSelectVersion` prop in `page.tsx` are removed along with `CTASection`.

## Out of Scope

- Passing color information to the Stripe payment intent (card display only)
- Any changes to the `/obrigado` success page
- Accessibility (ARIA roles, focus trapping) — not addressed in this iteration
- The legacy `Configurator` component beyond removing it from `page.tsx`
