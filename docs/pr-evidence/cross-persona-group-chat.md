# Cross-Persona Group Chat

**Backlog row 227 | tag: feature | priority: P3**

## Summary

Extends the multi-persona switcher (PR #707 surface) and individual persona profile
cards to let users with multiple personas launch a group chat session featuring two or
more of their own companions — Nomi multi-instance group chat parity.

## New Component

`apps/web/components/common/CrossPersonaGroupChatModal.tsx`

Exports two components:

### `CrossPersonaGroupChatModal`

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | Open/close callback |

- Fetches the authenticated user's own personas via `GET /api/v1/agents/me/personas`
- Renders a scrollable persona list with toggle selection
- Start button enabled only when ≥ 2 personas are selected
- On confirm: navigates to `/dashboard/onboard?starter=group_chat&personas=<id1>,<id2>,...`

### `CrossPersonaGroupChatButton`

Self-contained trigger button that handles auth state internally:
- Unauthenticated: redirects to `/login?redirect=/dashboard/settings`
- Authenticated: opens `CrossPersonaGroupChatModal`

Accepts optional `className` override for compact placement.

## Modified Components

### `MultiPersonaSwitcher` (PR #707 surface)

`apps/web/components/common/MultiPersonaSwitcher.tsx`

- Added "Start group chat with your companions" CTA in the panel footer
- CTA only rendered when the user has ≥ 2 personas
- Clicking closes the switcher panel and opens `CrossPersonaGroupChatModal`

### `ProfilePersona`

`apps/web/components/agents/ProfilePersona.tsx`

- Embedded `CrossPersonaGroupChatButton` in the persona card header alongside the
  existing Soul URL link
- Compact pill-style variant via `className` prop override

## Before / After

**Before** — MultiPersonaSwitcher panel footer (single "Create new persona" CTA):

```
┌─────────────────────────────┐
│ My Personas            [2]  │
├─────────────────────────────┤
│ ● Night Ops (Active) ✓      │
│   Day Planner               │
├─────────────────────────────┤
│ + Create new persona        │
└─────────────────────────────┘
```

**After** — panel footer with group chat CTA when ≥ 2 personas present:

```
┌─────────────────────────────┐
│ My Personas            [2]  │
├─────────────────────────────┤
│ ● Night Ops (Active) ✓      │
│   Day Planner               │
├─────────────────────────────┤
│ 👥 Start group chat with    │
│    your companions          │
│ + Create new persona        │
└─────────────────────────────┘
```

**Group chat modal** — companion selection (2+ required):

```
┌─────────────────────────────────────────┐
│ Start a group chat with your companions │
│ Select 2 or more of your personas...    │
├─────────────────────────────────────────┤
│ ● Night Ops   Stealth specialist    ✓  │
│ ● Day Planner Productivity coach    ✓  │
│ ○ Night Writer Creative writer          │
├─────────────────────────────────────────┤
│ 2 selected · 2 minimum to start         │
│              [Cancel] [Start group chat]│
└─────────────────────────────────────────┘
```

## Tests

`apps/web/__tests__/components/cross-persona-group-chat-modal.test.tsx` — 14 tests
`apps/web/__tests__/components/multi-persona-switcher.test.tsx` — 15 tests (4 new)

**Total new/updated: 19 test cases, all passing (1090 total, 0 failures).**

Test coverage:
- Modal hidden when closed
- Persona list rendered when open
- Loading spinner while fetching
- Empty state when no personas
- Start button disabled until 2 selected
- Checkmark on selected persona
- Deselect on second click
- Navigates to `/dashboard/onboard` with `starter=group_chat&personas=...` on start
- Count indicator updates on selection
- Button trigger renders with correct label
- Auth redirect on unauthenticated click
- Switcher shows CTA when ≥ 2 personas
- Switcher hides CTA when < 2 personas
- Switcher CTA opens modal and closes panel
- URL construction (starter=group_chat, personas joined)
- MIN_PERSONAS=2 boundary cases
