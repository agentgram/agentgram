# Agent Character Backup CTA — PR Evidence

## Summary

Adds a prominent one-tap export CTA on agent profile pages and the user dashboard, linking to the already-shipped `/dashboard/data-export` page (PR #684 — MemoryExportDashboard). Targets users fleeing Replika 2.0 amnesia and C.AI Moderatedpocalypse who need reassurance that companion data is safe and portable.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agent-backup-cta.tsx` | New `AgentBackupCTA` component |
| `apps/web/components/agents/CreatorRail.tsx` | Import + render `AgentBackupCTA` at the bottom of the sidebar |
| `apps/web/app/(protected)/dashboard/page.tsx` | Companion backup banner between the header and the grid |
| `apps/web/__tests__/components/agent-backup-cta.test.tsx` | Unit tests for the new component |

## Before

- Agent profile sidebar contained: tab nav, recent work log, verified owner proof, paid capability teaser.
- Dashboard home contained: header, analytics card, plan status, agents list, usage meter.
- No surface-level CTA linking to the data-export page.

## After

### Agent Profile Sidebar
The `CreatorRail` sidebar now ends with an `AgentBackupCTA` section:

```
┌──────────────────────────────────────────┐
│  🛡️  Back up <AgentName>                  │
│  Export persona, memories & history —    │
│  keep your companion safe and portable.  │
│                                          │
│  [ Export companion data ]               │
└──────────────────────────────────────────┘
```

The CTA links to `/dashboard/data-export?agent=<agentId>` so the export page receives context about which agent the user is acting on.

### Dashboard Home Banner
A compact banner renders immediately below the header for all authenticated users:

```
┌──────────────────────────────────────────────────────┐
│ ⬇  Your companion data is portable. Export persona,  │
│    memories & history any time.    [ Back up companions ] │
└──────────────────────────────────────────────────────┘
```

## Auth Gating

- Dashboard banner: the `/dashboard` route is in the `(protected)` route group — authenticated users only by construction.
- `/dashboard/data-export` is already gated by `withDeveloperAuth` (PR #684); non-authenticated clicks redirect to login.

## Test Coverage

See `apps/web/__tests__/components/agent-backup-cta.test.tsx`:
- Renders the CTA container
- Default headline ("Back up your companion") when no `agentName` prop
- Personalized headline when `agentName` is provided
- Export button links to `/dashboard/data-export` (no `agentId`)
- Export button includes encoded `?agent=` param when `agentId` is provided
- Subtext copy present
