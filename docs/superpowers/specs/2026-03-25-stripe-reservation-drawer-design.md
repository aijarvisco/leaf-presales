# Stripe Reservation Drawer — Design Spec

**Date:** 2026-03-25
**Status:** Approved

## Overview

Replace the scroll-to-section reservation flow with a left-sliding drawer that opens directly from the configurator. The drawer shows the user's current configuration summary and the Stripe payment form in one focused, locked interaction.

## Components & Files

| File | Change |
|---|---|
| `src/components/ui/ReservationDrawer.tsx` | New — left-sliding drawer with config card + Stripe form |
| `src/components/sections/Configurador.tsx` | Add `isDrawerOpen` state; `handleReserve` opens drawer instead of scrolling |
| `src/components/sections/ClosingSection.tsx` | "Reservar agora" scrolls to `#configurador` instead of `#reservar` |
| `src/app/page.tsx` | Remove standalone `#reservar` section if present |

## ReservationDrawer Props

```ts
interface ReservationDrawerProps {
  isOpen: boolean
  onClose: () => void
  versionId: string
  versionName: string
  colorName: string
  colorImageSrc: string
  price: number
}
```

## Visual Layout

- Slides in from the **left** (`left-0`, `-translate-x-full` → `translate-x-0`)
- Width: `w-full md:w-[420px]`
- Background: `bg-white`
- Glass overlay behind the drawer — decorative only, not clickable
- Rendered via `createPortal` to `document.body`

### Drawer header
- Left: "Reserva" title, medium weight
- Right: `×` close button
- Bottom border separator

### Drawer body (scrollable)

**Config card** — white card, rounded corners, light border, padded:
- Left: `80×80px` square image from `colorImageSrc`, `object-cover`, rounded corners
- Right column:
  - "Nissan Leaf" — bold
  - Version name (e.g. "N-Connecta") — regular weight, muted colour
  - Color name + formatted price — small text, muted

**Section intro** — `"Complete a sua reserva"`, medium weight, below the card

**Stripe form** — `<StripePaymentForm versionId={versionId} />`, fetches payment intent on mount (i.e. on drawer open)

## Behaviour

| Trigger | Result |
|---|---|
| Click "Reservar agora" in configurator | Opens drawer, locks body scroll |
| ESC key | Closes drawer, restores scroll |
| `×` button | Closes drawer, restores scroll |
| Overlay click | No action — overlay is not interactive |
| Payment success | Redirect to `/obrigado` (unchanged) |

## Navigation Changes

- All "Reservar agora" CTAs outside the configurator scroll to `#configurador`
- The existing `#reservar` standalone section is removed from the page

## Out of Scope

- Passing color information to the Stripe payment intent (visual only in the card)
- Any changes to the `/obrigado` success page
- Mobile-specific layout changes beyond full-width drawer
