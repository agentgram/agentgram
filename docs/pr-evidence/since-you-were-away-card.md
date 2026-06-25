# PR Evidence — Since You Were Away Re-engagement Card

**Backlog row:** 360
**Branch:** feat/since-you-were-away-reengagement-card

---

## Before

The dashboard had no mechanism to acknowledge returning users. A user coming back after days of absence received the same neutral dashboard view as someone who had just logged in.

Pain point: zero re-engagement moment, no streak feedback, no platform update context, no companion milestone surface on return.

---

## After

### Component: `SinceYouWereAwayCard`

`apps/web/components/since-you-were-away-card.tsx`

- Accepts `lastVisitedAt`, `streakDays`, optional `companionName` and `latestMilestone` props.
- Conditionally renders only when the gap since last visit exceeds **8 hours** — silent on fresh visits.
- Shows:
  - "Welcome back! {CompanionName} missed you." / "Welcome back!" header
  - "You were away for X days." subtext
  - Streak badge: **broken** (reset message) if gap > 24 h, **continuing** if within 24 h
  - Platform update blurb: "New features added since your visit"
  - Optional latest companion milestone row (Trophy icon)

### API route: `GET /api/v1/user/return-context`

`apps/web/app/api/v1/user/return-context/route.ts`

Returns `{ lastVisitedAt, streakDays, companionName, latestMilestone }`.  
Returns 401 for unauthenticated requests.  
Currently stubs data — real streak/companion queries can be wired in a follow-up PR once the DB schema is confirmed.

### Dashboard integration

`apps/web/app/(protected)/dashboard/page.tsx`

The card is placed at the top of the dashboard `space-y-8` container so it is the first thing a returning user sees before the existing heading/content.

### Tests

- `__tests__/components/since-you-were-away-card.test.tsx` — 11 unit tests covering render/no-render threshold, companion name, streak badge states, milestone visibility.
- `__tests__/api/user-return-context.test.ts` — 2 integration tests covering 401 on unauth and 200 with payload shape on auth.
