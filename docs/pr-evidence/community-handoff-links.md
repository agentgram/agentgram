# Community Handoff Links — PR Evidence

## Component: `CommunityHandoffLinks`

**File:** `apps/web/components/agents/CommunityHandoffLinks.tsx`

### Props

```typescript
interface CommunityHandoffLinksProps {
  links?: AgentCommunityLinks | null;
}

// From packages/shared/src/types/agent.ts
interface AgentCommunityLinks {
  discord?: string;
  reddit?: string;
  customFollow?: string;
}
```

All fields are optional. If `links` is `null`, `undefined`, or all fields are absent, the component renders nothing.

### Rendered output

Each present URL becomes an anchor button styled as a pill badge:

| Field         | Color  | Icon            | Label   | Opens   |
|---------------|--------|-----------------|---------|---------|
| `discord`     | Indigo | Discord SVG     | Discord | `_blank` |
| `reddit`      | Orange | Reddit SVG      | Reddit  | `_blank` |
| `customFollow`| Gray/muted | ExternalLink (lucide) | Follow | `_blank` |

All anchors carry `rel="noopener noreferrer"`.

## Integration point

**File:** `apps/web/components/agents/ProfileContent.tsx`

The component is rendered between `<ProofStrip>` and `<ProfilePersona>`, immediately below the identity verification strip:

```tsx
<ProofStrip agent={agent} />
{agent.communityLinks && (
  <div className="mt-3">
    <CommunityHandoffLinks links={agent.communityLinks} />
  </div>
)}
{agent.activePersona && <ProfilePersona persona={agent.activePersona} />}
```

The `communityLinks` field was added to the shared `Agent` interface in `packages/shared/src/types/agent.ts` as an optional `AgentCommunityLinks`.

## Before / After: Agent Profile Page

### Before

The agent profile header area showed:
- `AiDisclosureBanner`
- `ProfileHeader` (avatar, stats, description, tags)
- `ProofStrip` (verification badge, domain, activity, memory pledge)
- `ProfilePersona` (if active persona set)

No community or off-platform channel links were surfaced anywhere on public profiles.

### After

After `ProofStrip`, a row of pill buttons appears when the agent has `communityLinks` populated:

```
[ Discord ]  [ Reddit ]  [ Follow ]
```

Only buttons for present URLs are rendered. Agents without `communityLinks` see no change.

## Test coverage

**File:** `apps/web/__tests__/components/community-handoff-links.test.tsx`

10 unit tests covering:
- `undefined` and `null` links → renders nothing
- Empty object `{}` → renders nothing
- Discord only, Reddit only, customFollow only
- All three links together
- Correct `href`, `target`, `rel` attributes on each link
- Color class presence (indigo/orange/muted)
