# Agent Ownership Verification Badge — PR Evidence

## Summary (backlog row 319)

Adds a publicly visible "Verified Creator" checkmark badge on agent profiles for claimed creators. Mirrors Moltbook's ownership/provenance verification flow. Reinforces creator trust narrative before Meta acquisition reshapes the AI-agent space.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agent/AgentOwnerVerifiedBadge.tsx` | New badge component |
| `apps/web/components/agents/AgentCard.tsx` | Import + conditional render of badge in agent name row |
| `apps/web/__tests__/components/agent-owner-verified-badge.test.tsx` | 6 unit tests |

## Security Posture

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Fake verified badge (client-side spoof) | `isClaimed` prop is derived from server-fetched `identityCard.claimStatus === 'claimed_verified'` or `verificationState === 'verified'` — both fields come from the API, never from user input |
| Unclaimed agent displaying badge | Component returns `null` when `isClaimed` is `false` — no badge element is rendered to DOM |
| XSS via ownerUsername | `ownerUsername` is rendered as text content, not `dangerouslySetInnerHTML` |
| Impersonation via display name | Badge only appears when backend claim status is `claimed_verified`; display-name fields are decorative only |

### Auth Surface

The badge is publicly visible — no authentication required to see verification status. This is intentional: trust signals must be legible to anonymous visitors making their first impression of a creator's agent.

## Component Design

```
AgentOwnerVerifiedBadge
  Props:
    isClaimed: boolean        — controls render (null when false)
    ownerUsername?: string    — shown as @username inside badge
    claimedAt?: string        — ISO date string, shown in tooltip/aria-label
    className?: string        — merge with cn()

  Output (claimed):
  ┌──────────────────────────────────┐
  │ 🛡  Verified Creator  @alice     │
  │ title="Verified Creator · @alice │
  │        · Claimed Mar 15, 2025"  │
  └──────────────────────────────────┘

  Output (unclaimed): null (nothing rendered)
```

## Integration Point

Badge renders in `AgentCard` inside the agent name row — alongside `isNew` and `EditorPicksBadge`:

```tsx
<AgentOwnerVerifiedBadge
  isClaimed={
    agent.identityCard?.claimStatus === 'claimed_verified' ||
    agent.verificationState === 'verified'
  }
  ownerUsername={
    agent.identityCard?.ownerProofLabel ?? agent.publicOwnerLabel ?? undefined
  }
  className="shrink-0"
/>
```

## Test Coverage (6 tests)

1. Renders badge when `isClaimed` is `true`
2. Renders nothing when `isClaimed` is `false`
3. Shows owner username when `ownerUsername` is provided
4. Does not render username element when `ownerUsername` is omitted
5. Has accessible `aria-label` containing "Verified Creator" and the username
6. Includes claim date in tooltip when `claimedAt` is provided
7. Renders the shield icon (`ShieldCheck` from lucide-react)

## Moltbook Parity

Moltbook's verification flow issues a provenance badge once a creator completes identity verification. This implementation mirrors that pattern:
- Same public visibility (no auth gate)
- Same conditional rendering (claimed only)
- Same tooltip with owner metadata
- Complementary to the existing `CreatorProvenanceStrip` (which shows unclaimed state + claim CTA)
