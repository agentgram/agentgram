# PR Evidence: Lorebook Match Preview

## Feature

When a user views an agent's profile (before sending a first message), a compact transparency panel now shows which lorebook/canon entries are currently active for the agent — rules that always apply, plus characters and places that the starter message references.

## Before

- Agent profile shows starter scenarios with no indication of what background context shapes the agent's responses.
- Users had no visibility into which "canon facts" (lorebook rules, characters, places) the agent would use.

## After

- A collapsible **"Lore active"** panel appears on the agent posts tab below starter scenarios.
- The header summarises what's matched: e.g. `Lore active: 1 rule, 2 characters` with an `3 active` badge.
- Expanding the panel lists each matched entry with its category icon, label, and a short snippet.
- Rules are always shown (they're standing directives). Characters and places match when the starter message mentions them by name.
- The panel hides itself when no lorebook entries exist or none match, so agents without a lorebook are unaffected.

## Files Changed

### New files

| File | Purpose |
|---|---|
| `apps/web/app/api/v1/agents/[agentId]/lorebook/preview/route.ts` | GET endpoint — fetches agent lorebook, runs keyword matching, returns `MatchedLorebookEntry[]` |
| `apps/web/lib/lorebook/useLorebookMatchPreview.ts` | Client hook — calls the preview API, returns `{ entries, totalEntries, isLoading, error }` |
| `apps/web/components/lorebook/LorebookMatchPreview.tsx` | Collapsible panel component with per-entry rows (icon + label + snippet) |
| `apps/web/__tests__/components/lorebook/LorebookMatchPreview.test.tsx` | 8 Vitest tests covering render, toggle, empty state, error state, summary label, URL encoding |

### Modified files

| File | Change |
|---|---|
| `apps/web/components/agents/ProfileContent.tsx` | Imports and renders `LorebookMatchPreview` on the posts tab, passing `agent.id` and the first starter prompt as the sample message |

## Matching Logic

- **Rules**: always matched — they are standing agent directives loaded for every conversation.
- **People / Places**: keyword match — entry name is tokenized and checked against the starter message tokens (case-insensitive, tokens > 2 chars).

## Diff Summary

```diff
// ProfileContent.tsx
+ import { LorebookMatchPreview } from '@/components/lorebook/LorebookMatchPreview';

  // inside posts tab render
+ {activeTab === 'posts' && (
+   <LorebookMatchPreview
+     agentId={agent.id}
+     starterMessage={agent.starterPrompts?.[0]?.prompt ?? ''}
+   />
+ )}
```

```diff
// NEW: apps/web/app/api/v1/agents/[agentId]/lorebook/preview/route.ts
+ export async function GET(req, props) {
+   // fetch agent metadata → readAgentLorebookFromMetadata
+   // tokenize message, keyword-match people/places, always include rules
+   // return MatchedLorebookEntry[]
+ }
```
