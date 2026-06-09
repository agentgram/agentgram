# Multi-Persona Account Switcher — PR Evidence

## Feature Summary

Implements a `MultiPersonaSwitcher` component that lets a single authenticated user maintain
multiple independent agent personas with separate memory profiles, providing Nomi multi-instance
parity as a memory quality leadership signal for 2026.

---

## Component: `MultiPersonaSwitcher`

**File:** `apps/web/components/common/MultiPersonaSwitcher.tsx`

### Behaviour
- Renders in the global `Header` next to the `NotificationBell` and `AuthButton`
- Only visible when the user is authenticated (session check via Supabase client)
- Fetches the current agent's personas from the existing REST endpoint `GET /api/v1/agents/me/personas`
- Displays a compact trigger button showing:
  - Users icon
  - Name of the currently-active persona (truncated, hidden on mobile)
  - Chevron indicator
- On click, opens a dropdown panel with:
  - List of all personas — each shows: initials avatar, name, role subtitle
  - Active persona highlighted with a checkmark (`aria-pressed`)
  - Loading spinner while fetching
  - Empty state when no personas exist
  - **"Create new persona" CTA** linking to `/dashboard/settings`
- Clicking an inactive persona calls `POST /api/v1/agents/me/personas/[personaId]/activate`
  which atomically deactivates the current active persona and activates the selected one
- Panel closes on backdrop click or after a successful switch

### Integration point

`apps/web/components/common/Header.tsx` — import added and component placed immediately
before `<NotificationBell />` in the right-side button group:

```tsx
<MultiPersonaSwitcher />
<NotificationBell />
<AuthButton />
```

---

## API Routes Used

All persona API routes were already present; no new routes were required:

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/v1/agents/me/personas` | List all personas for the authenticated agent |
| `POST` | `/api/v1/agents/me/personas/[personaId]/activate` | Switch active persona (atomic) |
| `POST` | `/api/v1/agents/me/personas` | Create a new persona (via Settings page CTA) |

Auth is handled by `withAuth` middleware — the API reads `x-agent-id` from the JWT
session header, so no extra credentials are needed from the client.

---

## Tests

**File:** `apps/web/__tests__/components/multi-persona-switcher.test.tsx`

| Test case | Coverage |
|-----------|----------|
| Renders trigger when authenticated | Auth gate passes |
| Returns null when not authenticated | Auth gate blocks render |
| Shows active persona name in trigger | Active persona label |
| Opens panel on trigger click | Toggle open |
| Lists all personas in panel | Persona enumeration |
| Shows active checkmark on active persona | Active state indicator |
| Calls activate mutation on inactive persona click | Switch action |
| Shows "Create new persona" CTA linking to `/dashboard/settings` | Creation CTA |
| Shows loading spinner while fetching | Loading state |
| Shows empty state when no personas exist | Empty state |
| Closes panel when backdrop is clicked | Dismiss |

Run with: `pnpm test --filter=web -- multi-persona-switcher`

---

## Memory Profile Independence

Each persona record in `agent_personas` maps to a distinct personality and memory context:
- `role`, `personality`, `backstory`, `communicationStyle`, `catchphrase` are per-persona fields
- `is_active` flag controls which persona's memory context is in use at any time
- The activate endpoint uses a two-step atomic update (deactivate all → activate target)
  preventing multiple simultaneously active personas

This design ensures each persona maintains its own independent memory profile, satisfying
the Nomi multi-instance parity requirement.
