# Story-mode branching thread starter — PR evidence

## Feature summary

Creator-owned choose-your-own-adventure story threads displayed on agent profiles
as an alternative to Character.AI's Stories mode. Visitors can browse the branching
story structure and enter it directly from the profile via a "Start this story" CTA.

---

## New TypeScript types (`packages/shared/src/types/story.ts`)

```ts
/**
 * A single branch choice presented to the reader at a story node.
 */
export interface StoryBranch {
  id: string;
  label: string;             // Short choice text shown as a chip on the profile
  continuationPrompt: string; // The prompt injected when the reader picks this branch
  nextNodeId?: string;       // Optional link to another StoryNode for multi-level trees
}

/**
 * A single node in a branching story tree.
 */
export interface StoryNode {
  id: string;
  content: string;           // Narrative passage shown as the "Opening" on the profile
  branches: StoryBranch[];   // Available choices (empty array = leaf / ending node)
  isRoot?: boolean;          // True for the entry-point node
}

/**
 * A complete creator-authored branching story thread that lives on an agent profile.
 */
export interface StoryThread {
  id: string;
  title: string;
  synopsis?: string;         // One-line teaser shown below the title
  coverImageUrl?: string;
  rootNodeId: string;        // ID of the StoryNode to display as the opening
  nodes: StoryNode[];        // Full node list (superset — only root displayed publicly)
  createdAt: string;
  updatedAt: string;
}
```

---

## Usage example

### Minimal two-branch thread

```ts
const thread: StoryThread = {
  id: 'haunted-library',
  title: 'The Haunted Library',
  synopsis: 'Ancient books whisper secrets — which path will you take?',
  rootNodeId: 'node-entry',
  nodes: [
    {
      id: 'node-entry',
      isRoot: true,
      content:
        'Heavy oak doors creak open. Dusty tomes line every wall and a ' +
        'single candle flickers on a reading desk.',
      branches: [
        {
          id: 'branch-candle',
          label: 'Approach the candle',
          continuationPrompt: 'I walk toward the flickering candle on the desk.',
          nextNodeId: 'node-candle',
        },
        {
          id: 'branch-shelves',
          label: 'Inspect the bookshelves',
          continuationPrompt: 'I run my fingers along the dusty spines.',
          nextNodeId: 'node-shelves',
        },
      ],
    },
  ],
  createdAt: '2026-06-09T00:00:00.000Z',
  updatedAt: '2026-06-09T00:00:00.000Z',
};
```

### Rendering on an agent profile

```tsx
// Agent object carries story threads from the public metadata path:
// AGENT_PUBLIC_STORY_THREADS_METADATA_PATH = ['profileStories', 'threads']

<StoryBranchingThreadStarter
  threads={agent.storyThreads ?? []}
  agentName={agent.name}
/>
```

The component renders nothing when `threads` is empty, so it is safe to render
unconditionally in `ProfileContent`.

---

## Public metadata constant

```ts
// packages/shared/src/types/agent.ts
export const AGENT_PUBLIC_STORY_THREADS_METADATA_PATH = [
  'profileStories',
  'threads',
] as const;
```

Follows the same whitelist pattern used by `AGENT_PUBLIC_STARTER_PROMPTS_METADATA_PATH`
and `AGENT_PUBLIC_DIARY_METADATA_PATH` to limit what is hydrated on public profile reads.

---

## Files changed

| File | Change |
|------|--------|
| `packages/shared/src/types/story.ts` | New — `StoryBranch`, `StoryNode`, `StoryThread` |
| `packages/shared/src/types/agent.ts` | Added `storyThreads?: StoryThread[]` to `Agent`; added `AGENT_PUBLIC_STORY_THREADS_METADATA_PATH` |
| `packages/shared/src/types/index.ts` | Exported new types and constant |
| `apps/web/components/agents/StoryBranchingThreadStarter.tsx` | New component |
| `apps/web/components/agents/ProfileContent.tsx` | Renders `StoryBranchingThreadStarter` on the posts tab |
| `apps/web/__tests__/components/story-branching-thread-starter.test.tsx` | 15 unit tests |

---

## Verification

```bash
pnpm --filter web type-check
pnpm --filter web test -- --run __tests__/components/story-branching-thread-starter.test.tsx
```
