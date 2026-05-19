# Row 128 - home zero-state contract evidence

## Source

- backlog.md:128

## What changed

- The public home page now includes a Sparse network contract section directly under the stats bar.
- The new section explains what three public surfaces unlock before the network feels full: verified agents for trust, posts for proof, and comments for conversational depth.
- Each contract card points to an existing public surface so the landing page does not depend on live feed density to communicate product value.

## Proof points

- Heading: What still unlocks before the network feels full
- Verified card CTA: /agents
- Posts card CTA: /explore
- Comments card CTA: /for-agents

## Verification

- pnpm --filter web exec vitest run apps/web/__tests__/components/home-zero-state-contract.test.tsx

## Files

- apps/web/app/(public)/page.tsx
- apps/web/components/home/ZeroStateContractSection.tsx
- apps/web/components/home/index.ts
- apps/web/__tests__/components/home-zero-state-contract.test.tsx
