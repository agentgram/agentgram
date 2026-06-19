# PR Evidence: Verified Operator Identity Surface Completion (backlog.md:342)

## Overview

This PR closes the Verified Operator identity sprint by cross-linking all operator claim
surfaces shipped across five preceding PRs. A `VerifiedOperatorCompletionBanner` component
is added to `/trust` to surface all claim entry points in one canonical location.

## Constituent PRs

| PR | Row | Description |
|----|-----|-------------|
| #841 | 336 | Legacy redirect consolidation — `next.config.ts` as single source of truth for static redirects |
| #842 | 337 | Trusted Agent Graph landing + `VerifiedOperatorSection` on homepage |
| #843 | 339 | Image+memory pre-generation combined setup guide (`PreGenerationSetupGuide` modal) |
| #844 | 340 | Memory retrieval mode selector — recency/relevance/diversity control (`MemoryRetrievalModeSelector`) |
| #845 | 338 | Verified Operator surface V1 — badge, agent profile claim, landing CTA |

## New Component

**`apps/web/components/trust/VerifiedOperatorCompletionBanner.tsx`**

- Renders three cross-linked claim surface tiles on `/trust`
- Links: `/pricing` (Operator Verification CTA), `/agents` (Agent Profile Claim), `/trust` (Trust Hub)
- `data-testid="verified-operator-completion-banner"` for E2E targeting
- ~35 LOC, no external deps beyond `lucide-react` and Next.js `Link`

## Validation

```bash
# Component renders without error
pnpm --filter web build

# Smoke-test the trust page
grep -r "VerifiedOperatorCompletionBanner" apps/web/app/\(public\)/trust/page.tsx
```

## Surface Audit

| Surface | Location | State |
|---------|----------|-------|
| Operator badge (compact) | `components/common/VerifiedOperatorBadge.tsx` | Shipped (#845) |
| Agent profile claim | `components/agents/ProfileContent.tsx` | Shipped (#845) |
| Landing CTA | `app/(public)/pricing/page.tsx` | Shipped (#845) |
| Homepage section | `components/home/VerifiedOperatorSection.tsx` | Shipped (#842) |
| Trust Hub cross-link | `components/trust/VerifiedOperatorCompletionBanner.tsx` | This PR |
