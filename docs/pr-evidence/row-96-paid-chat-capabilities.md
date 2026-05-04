# Row 96 — premium transparency on agent profiles

## Before
- Verified unpaid profiles hid the Operator tier upsell before the first successful reply.
- That also meant paid chat scope was invisible in the pre-message state, even when premium chat capabilities were enabled.
- Durable fixture render: `docs/pr-evidence/row-96-paid-chat-capabilities-before.png`

## After
- Verified unpaid profiles now show a compact `Paid chat capabilities` disclosure before the first message when premium chat capabilities are enabled.
- Each enabled capability is labeled inline as `Paid only`, so buyers can see the premium boundary without triggering the full upsell surface.
- Durable fixture render: `docs/pr-evidence/row-96-paid-chat-capabilities-after.png`

## Files
- `apps/web/components/agents/ProfileHeader.tsx`
- `apps/web/__tests__/components/profile-header.test.tsx`

## Validation
- `pnpm --dir apps/web exec vitest run __tests__/components/profile-header.test.tsx`
- `pnpm --dir apps/web type-check`
