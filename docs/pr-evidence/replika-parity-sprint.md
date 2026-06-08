# PR Evidence: Replika Parity Sprint

## Summary

Two new components shipped to close the Replika feature gap:

1. **ContextConnectorsPreview** — pre-chat context panel
2. **CheckInConsentPanel** — proactive check-in consent modal

---

## 1. ContextConnectorsPreview

**File:** `apps/web/components/agents/ContextConnectorsPreview.tsx`

**What it does:**
A collapsible panel shown on the agent profile page (Posts tab) _before_ the first message is sent. It lists the context input types available to the agent — Links, Photos, App data — with Active/Inactive status for each.

**UI description:**
```
┌────────────────────────────────────┐
│ Context sources  [2 active]    ▼   │
└────────────────────────────────────┘

Expanded state:
┌────────────────────────────────────┐
│ Context sources  [2 active]    ▲   │
│  🔗 Links                  Active  │
│  🖼  Photos                 Active  │
│  🗄  App data             Inactive  │
└────────────────────────────────────┘
```

**Props:**
| Prop | Type | Default |
|------|------|---------|
| `sources` | `ContextSource[]` | Links + Photos (active), App data (inactive) |
| `className` | `string` | — |

**ContextSource shape:**
```ts
{ id: string; type: 'link' | 'photo' | 'app'; label: string; active: boolean }
```

**Placement:** Injected in `ProfileContent.tsx` above `ProfileStarterScenarios` when the Posts tab is active.

---

## 2. CheckInConsentPanel

**File:** `apps/web/components/agents/CheckInConsentPanel.tsx`

**What it does:**
A Dialog modal shown when the user taps "Enable check-ins" on an agent profile. Before opt-in is confirmed, the user sees:
- The check-in trigger reason (e.g., "triggered by scheduled send window")
- The next possible send window (formatted timestamp or "anytime")
- Quiet hours range (if enabled)
- **Mute** and **Allow** CTAs

**UI description:**
```
┌──────────────────────────────────┐
│  Allow check-ins from Aria?    ✕ │
│                                  │
│  Your agent may check in with    │
│  you triggered by scheduled      │
│  send window.                    │
│                                  │
│  Next possible message: Jun 9,   │
│  09:00 AM                        │
│                                  │
│  Quiet hours: 22:00–08:00        │
│                                  │
│            [Mute]  [Allow]       │
└──────────────────────────────────┘
```

**Props:**
| Prop | Type | Notes |
|------|------|-------|
| `open` | `boolean` | Controls visibility |
| `onOpenChange` | `(open: boolean) => void` | Dialog state handler |
| `agentName` | `string` | Shown in modal title |
| `settings` | `CheckInConsentSettings` | Optional; defaults to empty |
| `onAllow` | `() => void` | Called on Allow click |
| `onMute` | `() => void` | Called on Mute click |

`settings` fields: `lastAutoMessageTrigger`, `nextEligibleSendAt`, `quietHoursEnabled`, `quietHoursStart`, `quietHoursEnd` — all optional. Maps to `ProactiveControlsSettings` from `lib/proactive-controls.ts`.

**Trigger:** A small "Enable check-ins" pill button added to the bottom of the Posts tab in `ProfileContent.tsx`.

---

## Test Coverage

**File:** `apps/web/__tests__/components/context-connectors-preview.test.tsx`
- 12 tests — toggle collapse/expand, active count badge, source labels, aria-expanded, status text, default sources

**File:** `apps/web/__tests__/components/check-in-consent-panel.test.tsx`
- 13 tests — open/closed state, agent name, trigger labels, next window formatting, quiet hours display, Allow/Mute callbacks, overlay dismiss

**Total: 25 tests, all passing.**

```
PASS (25) FAIL (0)
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/agents/ContextConnectorsPreview.tsx` | New component |
| `apps/web/components/agents/CheckInConsentPanel.tsx` | New component |
| `apps/web/components/agents/ProfileContent.tsx` | Wire-in: both components added to Posts tab |
| `apps/web/__tests__/components/context-connectors-preview.test.tsx` | New tests (12) |
| `apps/web/__tests__/components/check-in-consent-panel.test.tsx` | New tests (13) |
| `docs/pr-evidence/replika-parity-sprint.md` | This file |
