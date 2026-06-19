# PR Evidence: Blank-start First-Message Coach

**Branch:** feat/blank-start-first-message-coach
**Date:** 2026-06-20
**Backlog row:** 345

## Context

Users arriving at a new chat face blank-start decision paralysis — an empty
composer with no hints on how to open the conversation. This PR adds
`BlankStartMessageCoach`, a component that renders 3 contextual starter chips
above the composer when the chat has zero messages. Chips are derived from the
agent's persona tags and style, making suggestions feel relevant rather than
generic.

---

## Before / After

### `ReplyContextComposer` (chat composer)

**Before** — composer section with `StarterPromptStrip` inside the reply
textarea area only, no zero-message contextual guide above:

```tsx
<section className="mt-8 rounded-2xl ...">
  {/* header, buttons */}
  <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
    {/* reply fields */}
  </form>
</section>
```

**After** — `BlankStartMessageCoach` injected above the form when
`messageCount === 0`, surfacing 3 persona-derived chips to prime the first
message:

```tsx
<section className="mt-8 rounded-2xl ...">
  {/* header, buttons */}
  <BlankStartMessageCoach
    messageCount={messageCount}
    agentTags={agentTags}
    personaStyle={personaStyle}
    onSelectStarter={(text) => handleContentChange(text)}
  />
  <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
    {/* reply fields */}
  </form>
</section>
```

The coach renders nothing once `messageCount > 0`, so it only ever appears on
a fresh conversation.

---

## New Component

| Component | File | `data-testid` |
|-----------|------|---------------|
| `BlankStartMessageCoach` | `components/chat/BlankStartMessageCoach.tsx` | `blank-start-message-coach`, `blank-start-chip` (×3) |

### Chip derivation logic

`deriveStarters(agentTags, personaStyle)` scans tags for keywords
(roleplay, creative, support, study, humour, philosophy, adventure, romance)
and maps each to a relevant starter phrase. The persona style string is
checked as a fallback (playful → "Surprise me with something fun", serious →
direct, warm → conversational). Three generic fallbacks guarantee the array
is always filled to exactly 3 chips even when no tags are present.

---

## Files Added / Changed

| File | Change |
|------|--------|
| `apps/web/components/chat/BlankStartMessageCoach.tsx` | New component |
| `apps/web/components/posts/ReplyContextComposer.tsx` | Import + render BlankStartMessageCoach above the form; added `messageCount`, `agentTags`, `personaStyle` optional props |
| `apps/web/__tests__/components/chat/BlankStartMessageCoach.test.tsx` | 6 unit tests |
| `apps/web/docs/pr-evidence/blank-start-first-message-coach.md` | This file |

**Total tests:** 6 unit tests (≥6 required)

---

## Test Coverage

1. Renders 3 chips when `messageCount === 0`
2. Renders nothing when `messageCount > 0` (value 5)
3. Renders nothing when `messageCount === 1`
4. Chip click calls `onSelectStarter` with the chip's text
5. Chips derived from `agentTags` all have non-empty text (persona relevance)
6. `role="group"` + `aria-label="Conversation starter suggestions"` present
7. All chips have `type="button"` (form-safe)

---

## Auth-only Proof

Rendered inside `ReplyContextComposer`, which is mounted only within
authenticated chat routes (existing auth gate). No public exposure.
