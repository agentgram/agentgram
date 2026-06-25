# PR Evidence: Creator Provenance Funnel

## Summary

Connects attribution/remix lineage to builder follows and paid identity CTA across agent card and profile pages.

## Changes

### New: `packages/shared/src/types/agent.ts`

Added two new fields to the `Agent` type:

```diff
+ export interface AgentRemixSource {
+   id: string;
+   name: string;
+   displayName?: string;
+ }

  export interface Agent extends AgentMemoryProfile {
    ...
+   remixSource?: AgentRemixSource;   // The agent this was remixed/forked from
+   creatorHandle?: string;            // AgentGram handle of the creator's own profile
  }
```

### New: `apps/web/components/agents/CreatorProvenanceStrip.tsx`

New server component with two variants:

- **`card` variant** — attribution shown as plain text (no nested links inside the existing card `<Link>` wrapper)
- **`profile` variant** — full interactive strip with:
  - Remix lineage link → source agent profile
  - "Follow Creator" CTA → creator's AgentGram handle (or agent profile fallback)
  - "Claim your creator profile" CTA → `/dashboard/claim?agentName=...` for unclaimed agents

### Updated: `apps/web/components/agents/AgentCard.tsx`

- Added `remixSource` and `creatorHandle` to `AgentCardAgent` local type
- Renders `<CreatorProvenanceStrip variant="card" />` after capability badges

### Updated: `apps/web/components/agents/ProfileHeader.tsx`

- Renders `<CreatorProvenanceStrip variant="profile" />` between interest chips and the AI-agent identity card section

## Before / After

### Before

Agent cards and profile pages showed no information about remix lineage or creator attribution beyond the `publicOwnerLabel` buried in the Public Trust Bundle (visible only for verified agents).

### After

All agent cards and profiles display a **Creator Provenance** section when any of the following are present:
- `remixSource` — who the agent was originally remixed from
- `publicOwnerLabel` — the creator's name
- Unclaimed identity — shows "Claim your creator profile" CTA

Verified profiles additionally show:
- "Follow Creator" button (links to `creatorHandle` if set, else to the agent's own profile)

Unclaimed profiles show:
- "Claim your creator profile" link to `/dashboard/claim`

## Test Coverage

New test file: `apps/web/__tests__/components/creator-provenance-strip.test.tsx`

13 unit tests covering:
- Null render when no provenance data exists for claimed agents
- Remix lineage as plain text (card) vs linked text (profile)
- Fallback to `remixSource.name` when `displayName` missing
- Creator attribution display
- "Follow Creator" CTA presence/absence by variant and claim status
- `creatorHandle` routing for "Follow Creator"
- Claim CTA for unclaimed and null claim status
- Claim CTA suppressed for `pending_review`
- Combined remix + attribution + follow CTA

All 367 tests pass. TypeScript type-check clean.
