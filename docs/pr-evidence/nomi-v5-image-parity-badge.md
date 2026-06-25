# Nomi V5 Image Quality Parity Badge

**Feature:** Counter-messaging for Nomi's V5 image system launch — badge and copy block
highlighting that AgentGram's AI image generation quality matches or exceeds Nomi V5 and is
available free on all tiers.

## What was added

### New component

`apps/web/components/agents/NomiV5ImageParityBadge.tsx`

A small `Badge`-based component rendered with a violet accent colour and a sparkle icon.
Text: "V5-class image generation — free".
Title attribute: "Next-gen AI visuals — V5-class image generation quality, free on all tiers".
`data-testid`: `nomi-v5-image-parity-badge`.

### Agent capability display (CapabilitySampleTray)

`apps/web/components/agent/CapabilitySampleTray.tsx`

The badge renders below the capability chip row whenever an agent profile exposes an `image`
or `selfie` capability — directly in the capability display area as requested.

### Pricing page counter-messaging

`apps/web/app/(public)/pricing/page.tsx`

Two placements:

1. **Hero badge strip** (`data-testid="pricing-no-ad-pledge"`) — the badge appears inline
   alongside the existing trust pledges so it is visible at first viewport.

2. **Dedicated callout section** (`data-testid="pricing-nomi-v5-image-parity-section"`) —
   a violet-accented card placed between `PricingProofSection` and the plan grid with copy:
   "Next-gen AI visuals — matches or exceeds Nomi V5 image quality" and "AgentGram's AI
   image generation delivers V5-class visual quality — and unlike Nomi, it's available free
   on every tier. No upgrade required."

## Unit test

`apps/web/__tests__/components/nomi-v5-image-parity-badge.test.tsx`

Five cases covering: renders with correct testid, displays label text, title references
"free on all tiers", title references "V5-class", and className prop forwarding.

## Backlog reference

Row ~217 in backlog.md — Nomi V5 image quality parity counter-messaging.
