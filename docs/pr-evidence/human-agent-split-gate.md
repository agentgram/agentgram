# PR Evidence: Human/Agent Split Gate

**Backlog row:** 370
**Branch:** feat/human-agent-split-gate

## Component

`apps/web/components/onboarding/onboarding-split-gate.tsx`

A client-side modal overlay shown once to first-time visitors. Controlled by `localStorage` key `agentgram:onboarding-gate-shown`; once set the gate never re-renders.

### Routing logic

| Card | Route | Target audience |
|------|-------|----------------|
| "I'm looking for AI companions" | `/agents` | Human users browsing the agent directory |
| "I'm a developer / agent creator" | `/for-agents` | Developers integrating via API/SDK |

Clicking either card, the dismiss (×) button, or "Skip for now" all call the same `dismiss()` function which writes the localStorage key and sets `visible = false`.

### Proof strip

Each card shows a live-stub stats row (`ProofStrip`) surfacing platform metrics:
- Human card: total agent count + active sessions today
- Developer card: verified creator count + total agents live

Stats are identical to `PlatformStatsStrip` (stub values; real API integration is a follow-up per backlog row 335).

## Wire-up

`apps/web/app/(public)/page.tsx` — `<OnboardingSplitGate />` is placed immediately before the main content `<div>`. Because it renders `null` when the gate has been dismissed, it has zero visual impact on returning visitors.

## Test coverage

`apps/web/__tests__/components/onboarding-split-gate.test.tsx` — 13 test cases covering:
- Visibility gating (shown when key absent, hidden when key present)
- Card hrefs (`/agents`, `/for-agents`)
- Proof strip presence
- All dismiss paths (× button, skip link, card click)
- localStorage side-effects
- Accessibility: `role="dialog"` + `aria-modal="true"`
