# PR Evidence: Per-Participant Memory Isolation Preview

## Before

The `StartGroupChatButton` dialog allowed selecting companions but gave no visibility
into which memory facts each participant could access:

```
┌─────────────────────────────────────────┐
│  Start a group chat                      │
│  Add companions to chat alongside Atlas  │
│─────────────────────────────────────────│
│  🔍 Search agents…                       │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ● Nova    @nova                     ││
│  │ ○ Aria    @aria                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  1/2 companions selected ·              │
│  Group chat setup happens in next step. │
│─────────────────────────────────────────│
│  [Cancel]           [Start group chat]  │
└─────────────────────────────────────────┘
```

No indication of memory isolation or which facts are shared vs. private.

---

## After

When companions are selected, a **Memory isolation preview** section appears
showing per-participant fact visibility with Eye (visible) and Lock (isolated) indicators:

```
┌─────────────────────────────────────────┐
│  Start a group chat                      │
│  Add companions to chat alongside Atlas  │
│─────────────────────────────────────────│
│  🔍 Search agents…                       │
│  ┌─ Nova ×  ──────────────────────────┐ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ✓ Nova    @nova                     ││
│  │ ○ Aria    @aria                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  1/2 companions selected                │
│                                         │
│  MEMORY ISOLATION  [preview]            │
│  Private facts stay scoped to each      │
│  agent's 1:1 context…                  │
│                                         │
│  ┌─ Atlas @atlas ───────────────────┐   │
│  │ 👁 Display name          [visible]│   │
│  │ 👁 Interests & hobbies   [visible]│   │
│  │ 👁 Past conversation history [visible]│
│  │ 👁 Relationship notes    [visible]│   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌─ Nova @nova ─────────────────────┐   │
│  │ 👁 Display name          [visible]│   │
│  │ 👁 Interests & hobbies   [visible]│   │
│  │ 🔒 Past conversation history [isolated]│
│  │ 🔒 Relationship notes  [isolated]│   │
│  └──────────────────────────────────┘   │
│─────────────────────────────────────────│
│  [Cancel]           [Start group chat]  │
└─────────────────────────────────────────┘
```

### Key differences
- **Anchor agent (Atlas)**: sees all facts (shared + private) — full access
- **Companion agents (Nova, Aria)**: sees shared facts only; private facts shown with lock icon and "isolated" badge
- Visual distinction: `Eye` (green, emerald-500) = visible; `Lock` (muted) = isolated
- Preview only appears when ≥1 companion is selected (renders `null` otherwise)
- Section labelled "MEMORY ISOLATION [preview]" to communicate non-production preview state

## Test coverage

15 tests across 4 describe blocks:
- **Visibility**: renders nothing with no companions; renders container, participant list, anchor row, companion rows
- **Fact visibility states**: anchor has all accessible + no restricted; companions have shared accessible + private restricted; badge labels
- **Custom facts**: custom `sampleFacts` prop accepted and rendered correctly
- **buildParticipantScopes unit**: return count, anchor scope, companion scope, multiple companions

## Auth-only proof

`GroupMemoryIsolationPreview` is rendered inside `StartGroupChatButton`, which:
1. Checks auth via `supabase.auth.getSession()` before opening the dialog
2. Redirects unauthenticated users to `/login?redirect=...`
3. Memory isolation preview is only reachable after the dialog opens (authenticated users only)
