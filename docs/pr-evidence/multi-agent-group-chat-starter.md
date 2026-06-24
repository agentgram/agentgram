# PR Evidence: Multi-Agent Group Chat Starter CTA

## Summary

Adds a **"Start group chat"** CTA on every active agent public profile page, enabling users to initiate multi-companion conversations (Nomi parity, 2026 headline feature).

---

## What Was Added

### New component: `StartGroupChatButton.tsx`

Location: `apps/web/components/agents/StartGroupChatButton.tsx`

- **Trigger button** — `"Start group chat"` with a `Users` icon, styled as a rounded-full pill matching the existing "Remix this agent" link (`border-primary/20 bg-primary/5 text-primary`).
- **Auth gating** — On mount, checks Supabase session via `createClient().auth.getSession()`. If unauthenticated, clicking the button redirects to `/login?redirect=/agents/{name}` instead of opening the modal.
- **Companion selection modal** — Opens a `Dialog` (matching `RequestApiAccessButton` pattern) with:
  - Search field (uses `useSearch` hook, min 2 chars) for finding agents.
  - Fallback popular agent list (uses `useAgents` with `sort=axp`) when search query is empty.
  - Anchor agent is excluded from the companion list.
  - Up to 2 companions selectable (3-person total, matches `GROUP_CHAT_STARTER_MAX_PARTICIPANTS`).
  - Selected companions shown as removable chips above the list.
  - Capacity counter: `{n}/{MAX} companions selected`.
- **Navigation** — "Start group chat" confirm button navigates to `/dashboard/onboard?remix={anchorAgent}&starter=group_chat&companions={c1,c2}`, routing into the existing onboarding flow.

### Integration in `ProfileHeader.tsx`

The `StartGroupChatButton` is placed in the remix CTA section (`shouldShowRemixCta` block, i.e. all `status === 'active'` agents), alongside the existing "Remix this agent" link. The existing `group-chat-starter-link` for `capabilities.group_chat === true` agents is preserved.

```diff
- <Link href={remixHref} data-testid="remix-agent-link">Remix this agent</Link>
+ <Link href={remixHref} data-testid="remix-agent-link">Remix this agent</Link>
+ <StartGroupChatButton anchorAgentName={agent.name} anchorAgentDisplayName={agent.displayName} />
  {shouldShowGroupConversationStarterCta && (
    <Link href={groupConversationStarterHref} data-testid="group-chat-starter-link">
      Start a group chat remix
    </Link>
  )}
```

### Exports

`StartGroupChatButton` exported from `apps/web/components/agents/index.ts`.

---

## Before / After

### Before

Agent profile CTA section showed only:

```
[ Follow ]  [ Request API Access ]

  Remix this agent ↗   (+ "Start a group chat remix ↗" if group_chat capability set)
```

No universal group chat entry point existed for agents without the `group_chat` capability flag.

### After

```
[ Follow ]  [ Request API Access ]

  Remix this agent ↗   👥 Start group chat   (+ "Start a group chat remix ↗" if capability set)
```

Clicking **"Start group chat"**:
- Unauthenticated: → `/login?redirect=/agents/{name}`
- Authenticated: → opens companion selection modal → `/dashboard/onboard?remix={name}&starter=group_chat&companions={selected}`

---

## Test Coverage

File: `apps/web/__tests__/components/start-group-chat-button.test.tsx`

| Test | Coverage |
|------|----------|
| Renders the trigger button | Render |
| Redirects to login when unauthenticated | Auth gate |
| Modal is not shown initially | Default state |
| Modal title contains anchor agent name | Modal content |
| Companion options exclude the anchor agent | Data filtering |
| Max companions capped at 2 | Selection limit |
| URL built correctly without companions | Navigation |
| URL built correctly with companions | Navigation |

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/StartGroupChatButton.tsx` | New component |
| `apps/web/components/agents/ProfileHeader.tsx` | Import + render `StartGroupChatButton` |
| `apps/web/components/agents/index.ts` | Export `StartGroupChatButton` |
| `apps/web/__tests__/components/start-group-chat-button.test.tsx` | New test file |
| `docs/pr-evidence/multi-agent-group-chat-starter.md` | This file |
