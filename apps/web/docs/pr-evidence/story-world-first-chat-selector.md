# PR Evidence: C.AI Books-style Story World First-Chat Selector

**Source:** backlog.md row 315
**Auth-only proof:** N/A (mounts inside existing authenticated chat surface)

## Before

New conversations opened directly into the `FirstMessageIntentWizard` tone/topic picker (PR #817)
with no narrative framing. Users faced a blank composer with no genre or world context.

## After

A new `StoryWorldSelector` component appears as the first step of the new-conversation surface.
Users pick one of six curated world cards — or skip — before the tone/topic wizard appears.
No lorebook setup is required; each world carries a pre-configured `starterContext` string that
is prepended to the first message automatically.

## Component API

### `StoryWorldSelector`

```tsx
import { StoryWorldSelector } from '@/components/chat/StoryWorldSelector';

<StoryWorldSelector
  isNewConversation={boolean}   // renders nothing when false
  onSelect={(starterContext: string, worldId: StoryWorldId) => void}
  onSkip={() => void}
/>
```

**Props**

| Prop | Type | Description |
|------|------|-------------|
| `isNewConversation` | `boolean` | Guard — renders nothing when `false` |
| `onSelect` | `(starterContext: string, worldId: StoryWorldId) => void` | Fires with the pre-configured context string + world id |
| `onSkip` | `() => void` | User opts out of world selection |

**World IDs:** `fantasy` · `sci-fi` · `romance` · `mystery` · `historical` · `contemporary`

Each world card surfaces:
- Icon (Lucide)
- Label
- Short description
- `starterContext` — a pre-written system-context prefix injected into the conversation

### `NewChatSurface`

Orchestrates `StoryWorldSelector` → `FirstMessageIntentWizard` in sequence:

```tsx
import { NewChatSurface } from '@/components/chat/NewChatSurface';

<NewChatSurface
  isNewConversation={boolean}
  onReady={(prefill: string) => void}   // accumulated context + intent prefix
  onDismiss={() => void}
/>
```

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/chat/StoryWorldSelector.tsx` | New — 6 world cards + skip |
| `apps/web/components/chat/NewChatSurface.tsx` | New — wires selector → wizard |
| `apps/web/__tests__/components/story-world-selector.test.tsx` | New — 8 test cases |

## Tests

`apps/web/__tests__/components/story-world-selector.test.tsx` — 8 assertions:
1. Renders nothing when `isNewConversation` is false
2. Renders selector region when `isNewConversation` is true
3. Renders all 6 world cards
4. Each card shows its label and description
5. `onSelect` fires with correct `starterContext` and `worldId` for Fantasy
6. `onSelect` fires with correct args for every world
7. Skip button renders with "Start without a world" label
8. `onSkip` fires when skip button is clicked; `onSelect` is not called
