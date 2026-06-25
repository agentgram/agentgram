# PR Evidence — big-tech-free-operator-badge

## What was built

`IndependentOperatorBadge` — a trust badge strip that explicitly communicates
"Independently owned & operated — not Meta/Big Tech." Integrated into the
landing hero (/) and /about pages.

## Why

The existing `IndependenceTrustBadge` (added in PR #745) says "not Meta" in
passing context. Backlog row 181 required an explicit, standalone badge making
the "not Meta/Big Tech" positioning a first-class trust signal, surfacing the
message on both high-traffic public pages.

## Files changed

- `apps/web/components/home/IndependentOperatorBadge.tsx` — new component
- `apps/web/components/home/index.ts` — added export
- `apps/web/app/(public)/page.tsx` — badge rendered after IndependenceTrustBadge
- `apps/web/app/(public)/about/page.tsx` — badge rendered before ReplikaCredentialTrustBadge
- `apps/web/__tests__/components/independent-operator-badge.test.tsx` — 5 unit tests

## Test results

```
PASS (5) FAIL (0)
```

Tests cover:
1. Renders with correct data-testid
2. Headline contains "not Meta/Big Tech"
3. Subtext mentions Moltbook/Meta Superintelligence Labs
4. Subtext affirms independent, open-source, community-driven
5. aria-label is accessible

## Source

Backlog row 181 — 2026-06-13
