# ContinuityReceiptCard — PR Evidence

## Component

`apps/web/components/continuity-receipt-card.tsx`

A client-side React component that renders a dismissible banner card for returning users who
have been away for 24 or more hours. It is hidden by default and activated on the client via
a `useEffect` that checks the elapsed time since `lastVisitedAt`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lastVisitedAt` | `string \| Date` | required | Timestamp of the user's last visit |
| `memoryCount` | `number` | `0` | Number of memories that survived the absence |
| `recentChanges` | `string \| null` | `null` | Optional summary of what changed; falls back to "변경된 것 없음" |
| `appUpdatedSince` | `boolean` | `false` | Whether the app was updated since the last visit |

## Dismissal Tracking

`sessionStorage` key `continuity-receipt-dismissed` is set to `'true'` when the user clicks
the close button. The card checks this key on mount, so it shows at most once per browser
session regardless of how many times the page is navigated.

## Route Placement

Rendered at the top of `/dashboard` (`apps/web/app/(protected)/dashboard/page.tsx`), before
the FadeIn-wrapped dashboard header, so it acts as a top-of-page banner for authenticated
returning users.

## Tests

`apps/web/__tests__/components/continuity-receipt-card.test.tsx` — 9 test cases covering:

- Renders at 24+ h gap, hidden under 24 h
- Memory count text
- Default and custom `recentChanges`
- `appUpdatedSince` label variants
- Dismiss button hides card
- `sessionStorage` prevents re-show within same session
- Accepts `Date` object for `lastVisitedAt`
