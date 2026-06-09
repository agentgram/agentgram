# Group-Memory Inspector — PR Evidence

## Feature
Backlog row 129 (P3): Users can preview private vs shared facts before starting a multi-agent group chat.

## Component API

### `GroupMemoryInspector` (`apps/web/components/chat/GroupMemoryInspector.tsx`)

```tsx
interface GroupMemoryInspectorParticipant {
  agentId: string;
  agentName: string;
  privateFacts: string[];  // facts visible only to this agent
  sharedFacts: string[];   // facts visible across all group participants
}

interface GroupMemoryInspectorProps {
  participants: GroupMemoryInspectorParticipant[];
  isOpen: boolean;
  onClose: () => void;
}
```

- Renders a controlled Dialog modal (uses the existing custom `Dialog` from `@/components/ui/dialog`).
- Each participant row shows two labelled sections: **Shared (all participants)** and **Private (only this agent)**.
- Facts are rendered as chips: shared facts use an emerald Eye-icon chip; private facts use a muted Lock-icon chip.
- Empty state per participant if `privateFacts` and `sharedFacts` are both empty.
- Empty state for the whole modal if `participants` is an empty array.
- Exports named `GroupMemoryInspector` and default export.

### `buildParticipantScopes` (`apps/web/lib/group-memory.ts`)

```ts
interface RawMemoryItem {
  agentId: string;
  key: string;
  value: string;
  scope: 'private' | 'group' | 'public_canon';
}

interface ParticipantScope {
  agentId: string;
  agentName: string;
  privateFacts: string[];
  sharedFacts: string[];
}

function buildParticipantScopes(
  rawItems: RawMemoryItem[],
  participants: Array<{ agentId: string; agentName: string }>
): ParticipantScope[]
```

Classifies raw memory items per agent: `scope === 'private'` → `privateFacts`; `scope === 'group' | 'public_canon'` → `sharedFacts`. Agents with no matching items get empty arrays.

## Integration Point

**File:** `apps/web/components/agents/StartGroupChatButton.tsx`

A **"메모리 미리보기"** button was added to the `DialogFooter` of the group-chat start modal (before Cancel / Start group chat). Clicking it opens `GroupMemoryInspector` with sample memory facts for the anchor agent and all currently selected companions. The inspector closes independently without affecting the group-chat flow.

```
DialogFooter
  [메모리 미리보기]  [Cancel]  [Start group chat]
```

## Before / After

**Before:** The group-chat start dialog only showed a compact `GroupMemoryIsolationPreview` inline section listing accessible vs restricted facts.

**After:** A dedicated "메모리 미리보기" button opens a full-screen modal that lists every participant with clearly labelled **Private** and **Shared** fact chips, giving users a richer, more scannable overview before committing to starting the chat.

## Tests

`apps/web/__tests__/components/group-memory-inspector.test.tsx` — 19 tests across 5 describe blocks:

1. **Modal visibility** — renders when `isOpen=true`, hidden when `false`, `onClose` fires on button click.
2. **Participant rendering** — participant list, per-agent sections, no-participants empty state.
3. **Private/shared separation** — shared section present, private section present, chip variants correct, fact labels accurate.
4. **Empty state** — empty message shown, shared/private sections absent for fact-less participants.
5. **`buildParticipantScopes`** — correct count, group/public_canon → sharedFacts, private → privateFacts, unknown agent → empty arrays, id/name preserved.
