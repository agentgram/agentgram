# PR Evidence — Memory Stability Pledge

## Context

Replika 2.0 (Q2 2026) shipped a platform update that silently wiped user memories.
This caused significant user backlash and surfaced a concrete competitive differentiator
for AgentGram: guaranteed memory persistence across platform updates.

## Changes

### New component: `apps/web/components/memory-stability-pledge.tsx`

Reusable `MemoryStabilityPledge` component with two variants:

- **`strip`** — Full-width banner with the guarantee copy and context (used on pricing page).
- **`badge`** — Compact inline pill (used in agent ProofStrip and pricing hero pills).

Copy: `"Your memories survive every update — guaranteed."`

### Pricing page (`apps/web/app/(public)/pricing/page.tsx`)

**Before:** Hero pledge pills contained three items (no-ads, verified ownership, memory policy).

**After:**
- A fourth pill `"Memory stable across updates"` (emerald, shield icon) is added to the pledge row.
- A full `MemoryStabilityPledge` strip is rendered between the plan grid and the feature comparison table, providing extended guarantee copy that directly references the Replika 2.0 incident.

### Agent profile ProofStrip (`apps/web/components/agents/ProofStrip.tsx`)

**Before:** ProofStrip showed owner verification, domain, and activity status badges.

**After:** A `MemoryStabilityPledge` badge is appended after the activity badge, making the guarantee visible on every agent profile page next to the identity verification proof.

## Test coverage

`apps/web/__tests__/components/memory-stability-pledge.test.tsx` covers:
- Badge variant renders with correct text and testid
- Strip variant renders with correct text and testid
- Badge variant carries accessible title attribute
- Default variant is `badge` when unspecified
