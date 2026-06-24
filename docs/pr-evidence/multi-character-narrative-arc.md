# PR Evidence — Multi-character Narrative Arc (Row 183)

## Feature summary

Adds `NarrativeArcConfig` — a creator-dashboard component that lets creators configure 2–3 agents in a shared persistent story thread, each assigned a narrative role (protagonist, antagonist, narrator, ally, oracle).

## Files added / modified

| Path | Change |
|------|--------|
| `apps/web/components/narrative/NarrativeArcConfig.tsx` | New component (modal + trigger button) |
| `apps/web/__tests__/components/narrative-arc-config.test.tsx` | 14 unit tests |
| `apps/web/app/(protected)/dashboard/page.tsx` | Integrated `NarrativeArcConfigButton` card into creator dashboard |

## Component API

```typescript
// Modal
<NarrativeArcConfig
  open={boolean}
  onOpenChange={(open: boolean) => void}
  onStart={(config: NarrativeArcStartConfig) => void}   // optional; falls back to router.push
/>

// Trigger button (auto-manages open state)
<NarrativeArcConfigButton className?: string />
```

```typescript
interface NarrativeArcStartConfig {
  participants: NarrativeArcParticipant[];  // 2–3 items
  premise: string;
  sharedThreadEnabled: boolean;
}

interface NarrativeArcParticipant {
  agentId: string;
  agentName: string;
  role: 'protagonist' | 'antagonist' | 'narrator' | 'ally' | 'oracle';
}
```

## Auth-only proof

The component is rendered inside `apps/web/app/(protected)/dashboard/page.tsx`. The `(protected)` route group enforces Supabase session auth before the page renders — unauthenticated users are redirected to `/auth/login`.

## Builds on

- PR #683 — multi-agent group chat infrastructure
- PR #752 — cross-persona group chat (session + URL param conventions)

## Test coverage (14 tests)

- Modal hidden when closed
- Agent list rendered when open
- Loading / error / empty states
- Start button disabled until ≥2 agents selected **and** all roles assigned
- Selection toggle + checkmark display
- Deselect removes role assignment
- Count indicator updates
- Premise textarea value binding
- Shared thread checkbox default on / toggle off
- `onStart` callback receives correct config
- `router.push` called with `starter=narrative_arc` when no `onStart` provided
- Trigger button renders and opens modal
- URL construction helpers (param encoding, min/max constraints)
